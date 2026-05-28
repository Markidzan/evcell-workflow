async function loadOrders() {
    const departmentId = document.getElementById('departmentSelect').value;
    const container = document.getElementById('ordersContainer');

    container.innerHTML = '<p class="text-gray-400 col-span-3 text-center">Завантаження замовлень...</p>';

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
            card.className = 'bg-gray-800 border border-gray-700 rounded-lg p-5 shadow-lg flex flex-col justify-between';

            card.innerHTML = `
                <div>
                    <div class="flex justify-between items-start mb-3">
                        <span class="text-xs font-mono px-2 py-1 bg-gray-700 rounded text-gray-300">ID: #${order.id}</span>
                        <span class="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded border border-green-500/30 font-semibold">${order.status}</span>
                    </div>
                    <p class="text-gray-200 text-sm mb-4">${order.description}</p>
                </div>

                <div class="border-t border-gray-700 pt-3 mt-4">
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

    const orderData = {
        description: description,
        deadline: deadline,
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
        } else {
            alert('Помилка при створені замовлення');
        }
    } catch (error) {
        console.error(error);
        alert('Не вдалося зв’язатися з сервером');
    }
}

async function moveOrder(orderId) {
    const nextDepartmentId = document.getElementById(`nextDept-${orderId}`).value;
    const comment = document.getElementById(`comment-${orderId}`).value;

    // Для тесту використовуємо id користувача = 1
    const userId = 1;

    try {
        const response = await fetch(`/api/orders/${orderId}/move?nextDepartmentId=${nextDepartmentId}&userId=${userId}&comment=${encodeURIComponent(comment)}`, {
            method: 'POST'
        });

        if (response.ok) {
            loadOrders();
        } else {
            alert('Помилка при переміщенні замовлення');
        }
    } catch (error) {
        console.error(error);
        alert('Помилка з’єднання з сервером');
    }
}

document.addEventListener('DOMContentLoaded', loadOrders);