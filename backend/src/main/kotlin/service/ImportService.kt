package com.finance.service

import com.finance.entity.ImportBatch
import com.finance.entity.User

interface ImportService {
    fun upload(fileName: String, rawText: String, user: User): ImportBatch
}