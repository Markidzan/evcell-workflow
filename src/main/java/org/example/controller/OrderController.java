package org.example.controller;

import org.example.entity.Order;
import org.example.entity.OrderHistory;
import org.example.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/create")
    public ResponseEntity<Order> createOrder(@RequestBody Order order, @RequestParam Long managerId) {
        Order createdOrder = orderService.createOrder(order, managerId);
        return ResponseEntity.ok(createdOrder);
    }

    @PostMapping("/{orderId}/move")
    public ResponseEntity<Order> moveOrder(@PathVariable Long orderId,
                                           @RequestParam Long nextDepartmentId,
                                           @RequestParam Long userId,
                                           @RequestParam(required = false) String comment) {
        Order updatedOrder = orderService.moveOrderToNextDepartment(orderId, nextDepartmentId, userId, comment);
        return ResponseEntity.ok(updatedOrder);
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<Order>> getOrdersByDepartment(@PathVariable Long departmentId) {
        List<Order> orders = orderService.getOrdersByDepartment(departmentId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}/history")
    public ResponseEntity<List<OrderHistory>> getOrderHistory(@PathVariable Long orderId) {
        List<OrderHistory> history = orderService.getOrderHistory(orderId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Long>> getStats() {
        return ResponseEntity.ok(orderService.getStatistics());
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<Void> addComment(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam String comment) {
        orderService.addOrderComment(id, userId, comment);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<Void> archiveOrder(@PathVariable Long id) {
        orderService.archiveOrder(id);
        return ResponseEntity.ok().build();
    }
}