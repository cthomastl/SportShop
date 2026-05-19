package com.sportshop.controller;

import com.sportshop.dto.OrderRequest;
import com.sportshop.model.Order;
import com.sportshop.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest request) {
        try {
            Order order = orderService.placeOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(order -> ResponseEntity.ok().body((Object) order))
                .orElse(ResponseEntity.notFound().build());
    }
}
