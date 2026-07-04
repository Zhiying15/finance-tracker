package com.financeentity

import jakarta.persistence.*

@Entity
@Table(name = "data_dictionary")
class DataDictionary(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,

    // Group name maps 1:1 to enum class name
    // e.g. "TRANSACTION_STATUS", "BUDGET_TYPE", "ASSET_CLASS"
    @Column(name = "group_name", nullable = false, length = 100)
    val groupName: String,

    // The raw enum constant name — what your backend stores in the DB
    // e.g. "PENDING_REVIEW", "NEED", "BANK"
    @Column(name = "code", nullable = false, length = 100)
    val code: String,

    // Human-readable label for the UI dropdown
    // e.g. "Pending Review", "Needs", "Bank Account"
    @Column(name = "label", nullable = false, length = 150)
    val label: String,

    // Optional tooltip or helper text shown in the UI
    @Column(name = "description", length = 255)
    val description: String? = null,

    // Controls sort order in dropdowns
    @Column(name = "display_order")
    val displayOrder: Int = 0,

    // Soft-disable a value without deleting it
    // e.g. hide VOID from creation dropdowns but keep for display
    @Column(name = "is_active")
    val isActive: Boolean = true,
)
