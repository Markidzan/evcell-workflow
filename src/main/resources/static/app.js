async function loadOrders() {
    const departmentId = document.getElementById('departmentSelect').value;
    const container = document.getElementById('ordersContainer');

    container.innerHTML = '<p class="text-gray-400 col-span-3 text-center">Завантаження замовлень...</p>';

    loadStats();

    try {
        const response = await fetch(`/api/orders/department/${departmentId}`);
        if (!response.ok) throw new Error('Помилка при завантаженні даних');

        const orders = await response.json();
        container.innerHTML = '';

        if (orders.length === 0) {
            container.innerHTML = '<p class="text-gray-500 col-span-3 text-center py-8">У цьому відділі немає активних замовлень.</p>';
            return;
        }

        orders.forEach(order => {
            const card = document.createElement('div');
            card.className = 'bg-gray-800 border border-gray-700 rounded-lg p-5 shadow-lg flex flex-col justify-between hover:border-gray-600 transition';

            card.innerHTML = `
                <div>
                    <div class="flex justify-between items-start mb-3">
                        <button onclick="viewHistory(${order.id})" class="text-xs font-mono px-2 py-1 bg-blue-900/40 text-blue-400 rounded border border-blue-800/50 hover:bg-blue-900/60 transition">
                            ID: #${order.id} 🔍 Історія
                        </button>
                        <span class="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded border border-green-500/30 font-semibold">${order.status}</span>
                    </div>

                    <div class="grid grid-cols-3 gap-2 mb-3 bg-gray-900/60 p-2 rounded text-center text-xs border border-gray-700/30">
                        <div><p class="text-gray-500 text-[10px] uppercase font-bold">Тип</p><p class="text-gray-200 font-medium">${order.cellType || '—'}</p></div>
                        <div><p class="text-gray-500 text-[10px] uppercase font-bold">Ємність</p><p class="text-green-400 font-medium">${order.capacityAh ? order.capacityAh + ' Ah' : '—'}</p></div>
                        <div><p class="text-gray-500 text-[10px] uppercase font-bold">Напруга</p><p class="text-blue-400 font-medium">${order.voltageV ? order.voltageV + ' V' : '—'}</p></div>
                    </div>

                    <p class="text-gray-300 text-sm mb-4 bg-gray-900/20 p-2 rounded border border-gray-800">${order.description}</p>
                </div>

                <div class="border-t border-gray-700 pt-3 mt-2">
                    <p class="text-xs text-gray-400 mb-2">Дедлайн: <strong class="text-gray-300">${order.deadline || 'Не вказано'}</strong></p>

                    <div class="bg-gray-900/50 p-2 rounded border border-gray-700/50 mt-3">
                        <label class="block text-[10px] text-gray-400 uppercase font-bold mb-1">Перенаправити у відділ:</label>
                        <div class="flex gap-1 mb-2">
                            <select id="nextDept-${order.id}" class="bg-gray-800 border border-gray-700 rounded p-1 text-xs w-full focus:outline-none focus:border-green-500">
                                <option value="2">Інженерний відділ</option>
                                <option value="3">Технічний відділ (Збірка)</option>
                                <option value="4">Відділ якості (QA/QC)</option>
                                <option value="5">Логістика та видача</option>
                            </select>
                        </div>
                        <input type="text" id="comment-${order.id}" placeholder="Коментар до кроку..." class="w-full bg-gray-800 border border-gray-700 rounded p-1 text-xs text-gray-200 mb-2 focus:outline-none focus:border-green-500">
                        <button onclick="moveOrder(${order.id})" class="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-1.5 rounded transition">
                            Підтвердити переміщення →
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="text-red-400 col-span-3 text-center">Не вдалося підключитися до сервера.</p>';
    }
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
    const cellType = document.getElementById('orderCellType').value;
    const capacityAh = document.getElementById('orderCapacity').value;
    const voltageV = document.getElementById('orderVoltage').value;

    const orderData = {
        description: description,
        deadline: deadline,
        cellType: cellType,
        capacityAh: parseInt(capacityAh),
        voltageV: parseInt(voltageV),
        currentDepartment: { id: 1 }
    };

    try {
        const response = await fetch('/api/orders/create?managerId=1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            closeModal();
            loadOrders();
            loadStats();
        } else {
            alert('Помилка при створенні замовлення');
        }
    } catch (error) {
        console.error(error);
        alert('Не вдалося зв’язатися з сервером');
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
            loadOrders();
            loadStats();
        } else {
            alert('Помилка при переміщенні замовлення');
        }
    } catch (error) {
        console.error(error);
        alert('Помилка з’єднання з сервером');
    }
}

async function viewHistory(orderId) {
    const content = document.getElementById('historyContent');
    content.innerHTML = '<p class="text-gray-400 text-center text-sm">Завантаження історії...</p>';
    document.getElementById('historyModal').classList.remove('hidden');

    try {
        const response = await fetch(`/api/orders/${orderId}/history`);
        if (!response.ok) throw new Error();
        const historyList = await response.json();
        content.innerHTML = '';

        if (historyList.length === 0) {
            content.innerHTML = '<p class="text-gray-500 text-center text-sm">Історія порожня.</p>';
            return;
        }

        historyList.forEach(item => {
            const row = document.createElement('div');
            row.className = 'border-l-2 border-blue-500 pl-4 py-1 bg-gray-900/40 rounded-r p-3 border border-gray-800';

            const date = item.changedAt ? new Date(item.changedAt).toLocaleString('uk-UA') : 'Не вказано';

            row.innerHTML = `
                <div class="flex justify-between items-center mb-1 text-xs">
                    <span class="font-semibold text-green-400 bg-green-950/50 px-2 py-0.5 rounded border border-green-900/30">${item.newStatus}</span>
                    <span class="text-gray-500">${date}</span>
                </div>
                <p class="text-sm text-gray-200 mt-1">${item.comment || 'Без коментаря'}</p>
                <div class="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                    <span>👤 Виконавець:</span>
                    <strong class="text-gray-300">${item.changedByUser ? item.changedByUser.name : 'Система'}</strong>
                    <span class="text-gray-500">(${item.changedByUser ? item.changedByUser.role : ''})</span>
                </div>
            `;
            content.appendChild(row);
        });

    } catch (error) {
        content.innerHTML = '<p class="text-red-400 text-center text-sm">Не вдалося завантажити історію кроків.</p>';
    }
}

function closeHistoryModal() {
    document.getElementById('historyModal').classList.add('hidden');
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
        console.error('Помилка завантаження статистики', error);
    }
}

document.addEventListener('DOMContentLoaded', loadOrders);