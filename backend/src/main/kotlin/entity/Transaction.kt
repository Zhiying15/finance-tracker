package com.finance.entity

import com.finance.constants.BudgetType
import com.finance.constants.TransactionFlow
import com.finance.constants.TransactionStatus
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "transactions")
class Transaction(

    @Id
    @Column(name = "id", length = 36, updatable = false, nullable = false)
    val id: String = UUID.randomUUID().toString(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_account_id")
    val fromAccount: Account? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_account_id")
    val toAccount: Account? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type_id")
    val transactionType: TransactionFlow? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "import_batch_id")
    val importedTransaction: ImportedTransaction? = null,

    @Column(name = "transaction_date", nullable = false)
    var transactionDate: LocalDate,

    @Column(name = "description", columnDefinition = "TEXT")
    var description: String? = null,

    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    val amount: BigDecimal,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "currency_code", nullable = false)
    val currency: Currency,

    @Column(name = "exchange_rate", precision = 18, scale = 8)
    val exchangeRate: BigDecimal = BigDecimal.ONE,

    @Column(name = "remarks", columnDefinition = "TEXT")
    var remarks: String? = null,

    @Column(name = "is_manual")
    val isManual: Boolean = false,

    @Column(name = "is_recurring")
    val isRecurring: Boolean = false,

    @Enumerated(EnumType.STRING)
    @Column(name = "budget_type")
    var budgetType: BudgetType? = null,

    ) : BaseEntity()