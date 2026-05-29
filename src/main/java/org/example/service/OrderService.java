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
        order.setCompletedQuantity(0);

        int seriesCount = 1;
        try {
            String config = order.getBatteryConfig().replaceAll("[^0-9]", "");
            if (!config.isEmpty()) {
                seriesCount = Integer.parseInt(config);
            }
        } catch (Exception e) {
            seriesCount = 1;
        }

        int totalCells = seriesCount * order.getQuantity();

        String smartDescription = String.format(
                "Партія: %d шт. Конфігурація: %s. Осередки: %s. Загальна кількість елементів для порізки та збірки: %d шт. %s",
                order.getQuantity(),
                order.getBatteryConfig(),
                order.getCellBrand(),
                totalCells,
                order.getDescription()
        );
        order.setDescription(smartDescription);

        Order savedOrder = orderRepository.save(order);

        OrderHistory history = new OrderHistory(
                savedOrder,
                "NEW",
                manager,
                LocalDateTime.now(),
                "Замовлення автоматично прораховано системою та передано на розгляд."
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
        return orderRepository.findByCurrentDepartmentIdAndIsArchivedFalse(departmentId);
    }

    public List<OrderHistory> getOrderHistory(Long orderId) {
        return historyRepository.findByOrderId(orderId);
    }

    public java.util.Map<String, Long> getStatistics() {
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("total", orderRepository.count());
        stats.put("new", orderRepository.countByStatus("NEW"));
        stats.put("inProgress", orderRepository.countByStatus("IN_PROGRESS"));
        stats.put("qa", orderRepository.countByStatus("QA_TESTING"));
        stats.put("done", orderRepository.countByStatus("DONE"));
        return stats;
    }

    @Transactional
    public void addOrderComment(Long orderId, Long userId, String comment) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        OrderHistory history = new OrderHistory(
                order,
                order.getStatus(), // статус залишається поточним
                user,
                LocalDateTime.now(),
                "[Коментар у чаті]: " + comment
        );
        historyRepository.save(history);
    }

    @Transactional
    public void archiveOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setIsArchived(true);
        orderRepository.save(order);
    }

    public List<Order> getAllActiveOrders() {
        return orderRepository.findAll().stream()
                .filter(order -> !order.getIsArchived())
                .collect(java.util.stream.Collectors.toList());
    }
}

