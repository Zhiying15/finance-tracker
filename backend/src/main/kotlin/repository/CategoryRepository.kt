package com.finance.repository

import com.finance.entity.Category
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface CategoryRepository : JpaRepository<Category, Int> {

    // Return system categories + user's own categories merged
    @Query("""
        SELECT c FROM CategoryEntity c
        WHERE c.user IS NULL OR c.user.id = :userId
        ORDER BY c.budgetType ASC, c.name ASC
    """)
    fun findAllForUser(userId: String): List<Category>
}