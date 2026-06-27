package com.finance.service.impl

import com.fasterxml.jackson.databind.ObjectMapper
import com.finance.entity.ImportBatch
import com.finance.entity.ImportTransaction
import com.finance.entity.User
import com.finance.repository.ImportBatchRepository
import com.finance.repository.ImportTransactionRepository
import com.finance.service.AiParserService
import com.finance.service.ImportService
import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.text.PDFTextStripper
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile

class ImportServiceImpl: ImportService {

    companion object {
        // Replaces Lombok's @Slf4j log instance
        private val log = LoggerFactory.getLogger(ImportServiceImpl::class.java)
    }

    @Autowired
    private lateinit var importRepo: ImportBatchRepository
    @Autowired
    private lateinit var importTxRepo: ImportTransactionRepository
    @Autowired
    private lateinit var aiService: AiParserService
    val mapper = ObjectMapper()

    override fun upload(fileName: String, rawText: String, user: User): ImportBatch {

        val batch = importRepo.save(
            ImportBatch(
                user = user,
                filename = fileName,
                status = "PROCESSING"
            )
        )

        val parsed = aiService.parse(rawText)

        parsed.forEach {
            importTxRepo.save(
                ImportTransaction(
                    batch = batch,
                    jsonData = mapper.readTree(it),
                    approved = false
                )
            )
        }

        batch.status = "REVIEW"
        return importRepo.save(batch)
    }

    fun extractText(file: MultipartFile): String {
        val pdf = PDDocument.load(file.inputStream)
        val stripper = PDFTextStripper()
        return stripper.getText(pdf)
    }
}