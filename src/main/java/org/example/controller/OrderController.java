package org.example.controller;

import org.example.entity.Order;
import org.example.entity.OrderHistory;
import org.example.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/create")
    public ResponseEntity<Order> createOrder(@RequestBody Order order, @RequestParam Long managerId) {
        return ResponseEntity.ok(orderService.createOrder(order, managerId));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<Order>> getOrdersByDepartment(@PathVariable Long departmentId) {
        if (departmentId == 0) {
            return ResponseEntity.ok(orderService.getAllActiveOrders());
        }
        return ResponseEntity.ok(orderService.getOrdersByDepartment(departmentId));
    }

    @PostMapping("/{id}/move")
    public ResponseEntity<Order> moveOrder(
            @PathVariable Long id,
            @RequestParam Long nextDepartmentId,
            @RequestParam Long userId,
            @RequestParam String comment) {
        return ResponseEntity.ok(orderService.moveOrderToNextDepartment(id, nextDepartmentId, userId, comment));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<OrderHistory>> getOrderHistory(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderHistory(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
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