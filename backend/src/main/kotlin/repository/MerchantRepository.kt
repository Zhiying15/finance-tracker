package com.finance.repository

import com.finance.entity.Merchant
import org.springframework.data.jpa.repository.JpaRepository

interface MerchantRepository : JpaRepository<Merchant, Long> {
}