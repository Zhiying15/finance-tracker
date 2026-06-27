package com.finance.repository

import com.finance.entity.Asset
import org.springframework.data.jpa.repository.JpaRepository

interface AssetRepository : JpaRepository<Asset, Long> {
}