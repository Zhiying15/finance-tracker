package com.finance.repository

import com.finance.entity.AccountType
import org.springframework.data.jpa.repository.JpaRepository

interface AccountTypeRepository : JpaRepository<AccountType, Long> {
}