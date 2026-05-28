package org.example.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private String status;
    private LocalDate deadline;

    @Column(name = "capacity_ah")
    private Integer capacityAh;

    @Column(name = "voltage_v")
    private Integer voltageV;

    @Column(name = "cell_type")
    private String cellType;

    @ManyToOne
    @JoinColumn(name = "current_department_id")
    private Department currentDepartment;

    public Order() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setLine(LocalDate deadline) {
        this.deadline = deadline;
    }

    public Integer getCapacityAh() {
        return capacityAh;
    }

    public void setCapacityAh(Integer capacityAh) {
        this.capacityAh = capacityAh;
    }

    public Integer getVoltageV() {
        return voltageV;
    }

    public void setVoltageV(Integer voltageV) {
        this.voltageV = voltageV;
    }

    public String getCellType() {
        return cellType;
    }

    public void setCellType(String cellType) {
        this.cellType = cellType;
    }

    public Department getCurrentDepartment() {
        return currentDepartment;
    }

    public void setCurrentDepartment(Department currentDepartment) {
        this.currentDepartment = currentDepartment;
    }
}