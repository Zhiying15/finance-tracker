package com.finance.repository

import com.finance.entity.Merchant
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MerchantRepository : JpaRepository<Merchant, Int> {
    fun findByUserIdAndMerchantNameIgnoreCase(userId: String, merchantName: String): Merchant?
}