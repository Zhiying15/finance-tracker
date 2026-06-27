package com.finance.repository

import com.finance.entity.Rule
import org.springframework.data.jpa.repository.JpaRepository

interface RuleRepository : JpaRepository<Rule, Long> {
}