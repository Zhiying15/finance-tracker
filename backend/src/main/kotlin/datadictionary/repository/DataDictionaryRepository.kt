package datadictionary.repository

import entity.DataDictionary
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DataDictionaryRepository : JpaRepository<DataDictionary, Int> {

    fun findAllByGroupNameAndIsActiveTrueOrderByDisplayOrderAsc(
        groupName: String,
    ): List<DataDictionary>

    fun findAllByIsActiveTrueOrderByGroupNameAscDisplayOrderAsc(): List<DataDictionary>

    fun existsByGroupNameAndCode(groupName: String, code: String): Boolean
}