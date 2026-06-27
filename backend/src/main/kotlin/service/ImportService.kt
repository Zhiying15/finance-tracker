package com.finance.service

import com.finance.entity.ImportBatch
import com.finance.entity.User
import org.springframework.stereotype.Service

@Service
interface ImportService {
    fun upload(fileName: String, rawText: String, user: User): ImportBatch
}