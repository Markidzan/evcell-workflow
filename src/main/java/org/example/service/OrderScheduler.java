package org.example.service;

import org.example.entity.Order;
import org.example.entity.OrderHistory;
import org.example.repository.OrderRepository;
import org.example.repository.OrderHistoryRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class OrderScheduler {

    private final OrderRepository orderRepository;
    private final OrderHistoryRepository historyRepository;

    public OrderScheduler(OrderRepository orderRepository, OrderHistoryRepository historyRepository) {
        this.orderRepository = orderRepository;
        this.historyRepository = historyRepository;
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkDeadlines() {
        List<Order> activeOrders = orderRepository.findAll();
        LocalDate today = LocalDate.now();

        for (Order order : activeOrders) {
            if (!"DONE".equals(order.getStatus()) && !"URGENT".equals(order.getStatus()) && order.getDeadline() != null) {
                if (order.getDeadline().isBefore(today.plusDays(3))) {
                    order.setStatus("URGENT");
                    orderRepository.save(order);

                    OrderHistory systemLog = new OrderHistory(
                            order,
                            "URGENT",
                            null, // null означає, що дію виконала автоматично система
                            LocalDateTime.now(),
                            "[Автоматичний контроль дедлайнів]: Залишилося менше 3 днів до здачі ТЗ! Статус підвищено до ТЕРМІНОВО."
                    );
                    historyRepository.save(systemLog);
                }
            }
        }
    }
}