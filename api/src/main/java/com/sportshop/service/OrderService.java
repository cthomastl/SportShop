package com.sportshop.service;

import com.sportshop.dto.OrderItemRequest;
import com.sportshop.dto.OrderRequest;
import com.sportshop.model.Order;
import com.sportshop.model.OrderItem;
import com.sportshop.model.Product;
import com.sportshop.repository.OrderRepository;
import com.sportshop.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Order placeOrder(OrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            if (itemRequest.getQuantity() == null || itemRequest.getQuantity() <= 0) {
                throw new IllegalArgumentException("Item quantity must be greater than zero");
            }

            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Product not found with id: " + itemRequest.getProductId()));

            if (product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new IllegalStateException(
                        "Insufficient stock for product: " + product.getName() +
                        ". Available: " + product.getStockQuantity() +
                        ", requested: " + itemRequest.getQuantity());
            }

            product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(product.getId());
            orderItem.setProductName(product.getName());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setQuantity(itemRequest.getQuantity());

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(lineTotal);

            orderItems.add(orderItem);
        }

        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setTotalAmount(totalAmount);
        order.setStatus("CONFIRMED");

        Order savedOrder = orderRepository.save(order);

        for (OrderItem item : orderItems) {
            item.setOrder(savedOrder);
        }
        savedOrder.setItems(orderItems);

        return orderRepository.save(savedOrder);
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }
}
