package importing.repository

import entity.ImportedFile
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ImportedFileRepository : JpaRepository<ImportedFile, String> {

    fun findAllByUserIdOrderByCreatedAtDesc(userId: String): List<ImportedFile>

    fun findByIdAndUserId(id: String, userId: String): ImportedFile?
}