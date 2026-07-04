package com.financeaccount.repository

import entity.AccountType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AccountTypeRepository : JpaRepository<AccountType, Int> {
    fun findAllByOrderByNameAsc(): List<AccountType>
}