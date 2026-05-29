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

    private Integer quantity;

    @Column(name = "completed_quantity")
    private Integer completedQuantity;

    @Column(name = "battery_config")
    private String batteryConfig;

    @Column(name = "cell_brand")
    private String cellBrand;

    @ManyToOne
    @JoinColumn(name = "current_department_id")
    private Department currentDepartment;

    @Column(name = "is_archived")
    private Boolean isArchived = false;

    public Boolean getIsArchived() {
        return isArchived;
    }

    public void setIsArchived(Boolean archived) {
        isArchived = archived;
    }

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

    public void setDeadline(LocalDate deadline) {
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

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getCompletedQuantity() {
        return completedQuantity;
    }

    public void setCompletedQuantity(Integer completedQuantity) {
        this.completedQuantity = completedQuantity;
    }

    public String getBatteryConfig() {
        return batteryConfig;
    }

    public void setBatteryConfig(String batteryConfig) {
        this.batteryConfig = batteryConfig;
    }

    public String getCellBrand() {
        return cellBrand;
    }

    public void setCellBrand(String cellBrand) {
        this.cellBrand = cellBrand;
    }

    public Department getCurrentDepartment() {
        return currentDepartment;
    }

    public void setCurrentDepartment(Department currentDepartment) {
        this.currentDepartment = currentDepartment;
    }


}