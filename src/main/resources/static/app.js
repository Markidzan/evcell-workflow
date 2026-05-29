let currentDepartmentId = 1;

async function loadOrders() {
    const container = document.getElementById('ordersContainer');
    container.innerHTML = '<p class="text-gray-400 col-span-3 text-center py-12">Синхронізація з цехом...</p>';
    await loadStats();

    try {
        const response = await fetch(`/api/orders/department/${currentDepartmentId}`);
        if (!response.ok) throw new Error();
        
        const orders = await response.json();
        container.innerHTML = '';

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="col-span-3 text-center py-16 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/10">
                    <i data-lucide="folder-open" class="w-12 h-12 text-gray-600 mx-auto mb-3"></i>
                    <p class="text-gray-500 text-sm font-medium">У цьому відділі немає активних замовлень.</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        orders.forEach(order => {
            const card = document.createElement('div');
            
            // Динамічний підбір кольору неонового підсвічування залежно від статусу замовлення
            let statusClasses = "bg-blue-500/10 text-blue-400 border-blue-500/20";
            let cardBorderClass = "border-gray-800/80";
            let badgePulse = "";

            if (order.status === 'NEW') {
                statusClasses = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
                badgePulse = '<span class="flex h-2 w-2 relative"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span></span>';
            } else if (order.status === 'URGENT') {
                statusClasses = "bg-red-500/10 text-red-400 border-red-500/30 font-bold";
                cardBorderClass = "border-red-900/40 shadow-lg shadow-red-950/20 animate-pulse";
                badgePulse = '<span class="flex h-2 w-2 relative"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>';
            } else if (order.status === 'DONE') {
                statusClasses = "bg-green-500/10 text-green-400 border-green-500/20";
            } else if (order.status === 'QA_TESTING') {
                statusClasses = "bg-purple-500/10 text-purple-400 border-purple-500/20";
            }

            card.className = `glass border ${cardBorderClass} rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-gray-700 hover:shadow-2xl hover:shadow-gray-950/40 transition-all duration-300`;
            
            card.innerHTML = `
                <div>
                    <div class="flex justify-between items-center mb-4">
                        <button onclick="viewHistory(${order.id})" class="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 bg-gray-900 border border-gray-700/80 hover:border-blue-500 rounded-lg text-gray-300 hover:text-blue-400 transition-all">
                            <i data-lucide="history" class="w-3.5 h-3.5"></i> ID: #${order.id}
                        </button>
                        <span class="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${statusClasses}">
                            ${badgePulse} ${order.status}
                        </span>
                    </div>
                    
                    <div class="grid grid-cols-4 gap-1 mb-4 bg-[#0b0f19]/80 p-2.5 rounded-xl text-center text-[11px] border border-gray-800">
                        <div><p class="text-gray-500 text-[9px] uppercase font-bold tracking-wider mb-0.5">Конфіг</p><p class="text-gray-200 font-semibold">${order.batteryConfig || '—'}</p></div>
                        <div><p class="text-gray-500 text-[9px] uppercase font-bold tracking-wider mb-0.5">Бренд</p><p class="text-gray-200 font-semibold truncate px-0.5">${order.cellBrand || '—'}</p></div>
                        <div><p class="text-gray-500 text-[9px] uppercase font-bold tracking-wider mb-0.5">Обсяг</p><p class="text-yellow-400 font-black">${order.quantity || 1} шт</p></div>
                        <div><p class="text-gray-500 text-[9px] uppercase font-bold tracking-wider mb-0.5">Номінал</p><p class="text-blue-400 font-semibold">${order.capacityAh}Ah/${order.voltageV}V</p></div>
                    </div>

                    <p class="text-gray-300 text-sm mb-5 bg-[#0b0f19]/30 p-3 rounded-xl border border-gray-800/40 leading-relaxed font-medium">${order.description}</p>
                </div>
                
                <div class="border-t border-gray-800/60 pt-4 mt-2">
                    <div class="flex items-center gap-1 text-xs text-gray-400 mb-3 font-medium">
                        <i data-lucide="calendar" class="w-3.5 h-3.5 text-gray-500"></i>
                        <span>Граничний термін: <strong class="text-gray-200 font-semibold">${order.deadline || 'Не вказано'}</strong></span>
                    </div>
                    
                    <div class="mt-2">
                        ${order.status === 'DONE' || currentDepartmentId == 5 ? `
                            <button onclick="archiveOrder(${order.id})" class="w-full bg-red-950/40 hover:bg-red-900 border border-red-900/40 text-red-400 hover:text-white text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
                                <i data-lucide="archive" class="w-3.5 h-3.5"></i> Здати в архів виробництва
                            </button>
                        ` : `
                            <div class="bg-[#0b0f19]/60 p-3 rounded-xl border border-gray-800">
                                <label class="block text-[9px] text-gray-500 uppercase font-black tracking-wider mb-1.5 flex items-center gap-1">
                                    <i data-lucide="corner-down-right" class="w-3 h-3"></i> Перенаправити на наступний етап:
                                </label>
                                <div class="flex gap-1 mb-2">
                                    <select id="nextDept-${order.id}" class="bg-[#0b0f19] border border-gray-700 rounded-lg p-2 text-xs w-full focus:outline-none focus:border-green-500 text-gray-200 font-medium">
                                        <option value="2">⚙️ Інженерний відділ</option>
                                        <option value="3">🛠️ Технічний цех (Збірка)</option>
                                        <option value="4">🧪 Відділ якості (QA/QC)</option>
                                        <option value="5">🚚 Логістика та видача</option>
                                    </select>
                                </div>
                                <input type="text" id="comment-${order.id}" placeholder="Супровідний коментар цеху..." class="w-full bg-[#0b0f19] border border-gray-700 rounded-lg p-2 text-xs text-gray-200 mb-2 focus:outline-none focus:border-green-500 font-medium">
                                <button onclick="moveOrder(${order.id})" class="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 rounded-lg transition shadow-md flex items-center justify-center gap-1">
                                    Підтвердити крок <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                                </button>
                            </div>
                        `}
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Ініціалізуємо іконки Lucide на згенерованих картках
        lucide.createIcons();

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="text-red-400 col-span-3 text-center py-12">Помилка синхронізації з базою даних.</p>';
    }
}

function switchDepartment(deptId, buttonElement) {
    currentDepartmentId = deptId;
    
    // Оновлюємо заголовок на сторінці
    document.getElementById('currentDepartmentTitle').innerText = buttonElement.innerText;

    // Скидаємо активний клас зі всіх кнопок меню
    const navButtons = document.querySelectorAll('#sidebarNavigation button');
    navButtons.forEach(btn => {
        btn.className = "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-gray-400 hover:bg-gray-800/60 hover:text-gray-200";
    });

    // Підсвічуємо поточну кнопку
    buttonElement.className = "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition bg-green-600 text-white shadow-lg shadow-green-600/10";

    loadOrders();
}

function openModal() {
    document.getElementById('orderModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('orderModal').classList.add('hidden');
    document.getElementById('orderForm').reset();
}

async function createOrder(event) {
    event.preventDefault();

    const description = document.getElementById('orderDescription').value;
    const deadline = document.getElementById('orderDeadline').value;
    const cellBrand = document.getElementById('orderCellBrand').value;
    const batteryConfig = document.getElementById('orderBatteryConfig').value;
    const quantity = document.getElementById('orderQuantity').value;
    const capacityAh = document.getElementById('orderCapacity').value;
    const voltageV = document.getElementById('orderVoltage').value;

    const orderData = {
        description: description,
        deadline: deadline,
        cellBrand: cellBrand,
        batteryConfig: batteryConfig,
        quantity: parseInt(quantity) || 1,
        capacityAh: parseInt(capacityAh) || 0,
        voltageV: parseInt(voltageV) || 0,
        currentDepartment: { id: 1 } // Створюється у відділі Менеджменту
    };

    try {
        const response = await fetch('/api/orders/create?managerId=1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            closeModal();
            await loadOrders(); // Оновлюємо список на екрані
        } else {
            alert('Помилка сервера при створенні замовлення. Перевірте логи Spring Boot.');
        }
    } catch (error) {
        console.error(error);
        alert('Не вдалося зв’язатися з сервером.');
    }
}

async function moveOrder(orderId) {
    const nextDepartmentId = document.getElementById(`nextDept-${orderId}`).value;
    const comment = document.getElementById(`comment-${orderId}`).value;
    const userId = 1; 

    try {
        const response = await fetch(`/api/orders/${orderId}/move?nextDepartmentId=${nextDepartmentId}&userId=${userId}&comment=${encodeURIComponent(comment)}`, {
            method: 'POST'
        });

        if (response.ok) {
            await loadOrders();
        } else {
            alert('Помилка при переміщенні замовлення');
        }
    } catch (error) {
        console.error(error);
    }
}

async function viewHistory(orderId) {
    document.getElementById('activeHistoryOrderId').value = orderId;
    const content = document.getElementById('historyContent');
    content.innerHTML = '<p class="text-gray-400 text-center py-8">Завантаження стрічки замовлення...</p>';
    document.getElementById('historyModal').classList.remove('hidden');

    try {
        const response = await fetch(`/api/orders/${orderId}/history`);
        if (!response.ok) throw new Error();
        const historyList = await response.json();
        content.innerHTML = '';

        if (historyList.length === 0) {
            content.innerHTML = '<p class="text-gray-500 text-center py-8">Журнал порожній.</p>';
            return;
        }

        historyList.forEach(item => {
            const row = document.createElement('div');
            
            if (item.comment && item.comment.startsWith("[Коментар у чаті]")) {
                // Візуальний рендеринг чат-повідомлення (як у месенджері)
                row.className = 'bg-blue-950/20 border border-blue-900/30 rounded-xl p-3 ml-6 relative';
                row.innerHTML = `
                    <div class="flex justify-between items-center mb-1 text-[11px] text-blue-400 font-medium">
                        <span>💬 Питання/Обговорення</span>
                        <span class="text-gray-500">${item.changedAt ? new Date(item.changedAt).toLocaleString('uk-UA') : ''}</span>
                    </div>
                    <p class="text-sm text-gray-200 font-medium">${item.comment.replace("[Коментар у чаті]: ", "")}</p>
                    <div class="text-[10px] text-gray-400 mt-2 font-semibold">
                        👤 ${item.changedByUser ? item.changedByUser.name : 'Гість'} <span class="text-gray-500 font-normal">(${item.changedByUser ? item.changedByUser.role : ''})</span>
                    </div>
                `;
            } else {
                // Візуальний рендеринг кроку зміни статусу конвеєра
                row.className = 'border-l-2 border-emerald-500 pl-4 py-1 bg-gray-900/30 rounded-r-xl p-3 border border-gray-800';
                row.innerHTML = `
                    <div class="flex justify-between items-center mb-1 text-xs">
                        <span class="font-bold text-xs text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30">${item.newStatus}</span>
                        <span class="text-[11px] text-gray-500 font-medium">${item.changedAt ? new Date(item.changedAt).toLocaleString('uk-UA') : ''}</span>
                    </div>
                    <p class="text-sm text-gray-300 font-medium mt-1">${item.comment || 'Крок підтверджено без коментаря.'}</p>
                    <div class="text-[10px] text-gray-400 mt-2 font-semibold">
                        ⚙️ Операцію виконав: <span class="text-gray-200">${item.changedByUser ? item.changedByUser.name : 'Система автоматизації'}</span>
                    </div>
                `;
            }
            content.appendChild(row);
        });

        lucide.createIcons();

    } catch (error) {
        content.innerHTML = '<p class="text-red-400 text-center py-8">Не вдалося завантажити дані журналу.</p>';
    }
}

function closeHistoryModal() {
    document.getElementById('historyModal').classList.add('hidden');
}

async function sendChatComment() {
    const orderId = document.getElementById('activeHistoryOrderId').value;
    const commentInput = document.getElementById('chatCommentInput');
    const comment = commentInput.value.trim();
    const userId = 1;

    if (!comment) return;

    try {
        const response = await fetch(`/api/orders/${orderId}/comment?userId=${userId}&comment=${encodeURIComponent(comment)}`, {
            method: 'POST'
        });

        if (response.ok) {
            commentInput.value = '';
            await viewHistory(orderId);
        }
    } catch (error) {
        console.error(error);
    }
}

async function archiveOrder(orderId) {
    if (!confirm('Вилучити замовлення з поточної лінії конвеєра та відправити в архів готовності?')) return;

    try {
        const response = await fetch(`/api/orders/${orderId}/archive`, { method: 'POST' });
        if (response.ok) {
            await loadOrders();
        }
    } catch (error) {
        console.error(error);
    }
}

async function loadStats() {
    try {
        const response = await fetch('/api/orders/stats');
        if (!response.ok) throw new Error();
        const stats = await response.json();
        
        document.getElementById('statTotal').innerText = stats.total || 0;
        document.getElementById('statNew').innerText = stats.new || 0;
        document.getElementById('statInProgress').innerText = stats.inProgress || 0;
        document.getElementById('statQA').innerText = stats.qa || 0;
        document.getElementById('statDone').innerText = stats.done || 0;
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    lucide.createIcons();
});

function clickStatCard(deptId) {
    currentDepartmentId = deptId;

    const navButtons = document.querySelectorAll('#sidebarNavigation button');

    if (deptId === 0) {
        // Якщо обрано "Всі замовлення", знімаємо підсвічування з усіх кнопок цехів
        navButtons.forEach(btn => {
            btn.className = "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-gray-400 hover:bg-gray-800/60 hover:text-gray-200";
        });
        // Оновлюємо головний заголовок
        document.getElementById('currentDepartmentTitle').innerText = "📊 Загальний моніторинг (Всі замовлення EVCELL)";
    } else {
        // Звичайне перемикання по конкретних цехах
        navButtons.forEach((btn, index) => {
            if (index + 1 === deptId) {
                btn.className = "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition bg-green-600 text-white shadow-lg shadow-green-600/10";
                document.getElementById('currentDepartmentTitle').innerText = btn.innerText;
            } else {
                btn.className = "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-gray-400 hover:bg-gray-800/60 hover:text-gray-200";
            }
        });
    }

    // Завантажуємо дані з сервера
    loadOrders();
}
}