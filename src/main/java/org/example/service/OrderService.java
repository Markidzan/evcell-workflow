package org.example.service;

import org.example.entity.Department;
import org.example.entity.Order;
import org.example.entity.OrderHistory;
import org.example.entity.User;
import org.example.repository.DepartmentRepository;
import org.example.repository.OrderHistoryRepository;
import org.example.repository.OrderRepository;
import org.example.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderHistoryRepository historyRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, OrderHistoryRepository historyRepository,
                        DepartmentRepository departmentRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.historyRepository = historyRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Order createOrder(Order order, Long managerId) {
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new IllegalArgumentException("Manager not found"));

        order.setStatus("NEW");
        Order savedOrder = orderRepository.save(order);

        OrderHistory history = new OrderHistory(
                savedOrder,
                "NEW",
                manager,
                LocalDateTime.now(),
                "Замовлення успішно створено менеджерським відділом EVCELL"
        );
        historyRepository.save(history);

        return savedOrder;
    }

    @Transactional
    public Order moveOrderToNextDepartment(Long orderId, Long nextDepartmentId, Long userId, String comment) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        Department nextDepartment = departmentRepository.findById(nextDepartmentId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        order.setCurrentDepartment(nextDepartment);

        if (nextDepartmentId == 5) {
            order.setStatus("DONE");
        } else if (nextDepartmentId == 4) {
            order.setStatus("QA_TESTING");
        } else {
            order.setStatus("IN_PROGRESS");
        }

        Order updatedOrder = orderRepository.save(order);

        OrderHistory history = new OrderHistory(
                updatedOrder,
                updatedOrder.getStatus(),
                user,
                LocalDateTime.now(),
                comment
        );
        historyRepository.save(history);

        return updatedOrder;
    }

    public List<Order> getOrdersByDepartment(Long departmentId) {
        return orderRepository.findByCurrentDepartmentId(departmentId);
    }

    public List<OrderHistory> getOrderHistory(Long orderId) {
        return historyRepository.findByOrderId(orderId);
    }
}