package com.financedatadictionary.service.impl

import common.exception.AppException
import datadictionary.dto.response.DataDictionaryGroupResponse
import datadictionary.dto.response.DataDictionaryItemResponse
import datadictionary.repository.DataDictionaryRepository
import datadictionary.service.DataDictionaryService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DataDictionaryServiceImpl(
    private val repository: DataDictionaryRepository,
) : DataDictionaryService {
    // All valid group names — prevents arbitrary string injection
    private val validGroups = setOf(
        "TRANSACTION_FLOW",
        "BUDGET_TYPE",
        "IMPORT_REVIEW_STATUS",
        "ACCOUNT_CATEGORY",
        "ASSET_CLASS",
        "IMPORTED_FILE_STATUS",
    )

    @Transactional(readOnly = true)
    override fun getGroup(groupName: String): DataDictionaryGroupResponse {
        val upper = groupName.uppercase()

        if (upper !in validGroups) {
            throw AppException.NotFound("Unknown data dictionary group: '$groupName'")
        }

        val items = repository
            .findAllByGroupNameAndIsActiveTrueOrderByDisplayOrderAsc(upper)
            .map { DataDictionaryItemResponse.from(it) }

        return DataDictionaryGroupResponse(group = upper, items = items)
    }

    @Transactional(readOnly = true)
    override fun getAllGroups(): List<DataDictionaryGroupResponse> =
        repository
            .findAllByIsActiveTrueOrderByGroupNameAscDisplayOrderAsc()
            .groupBy { it.groupName }
            .map { (group, entries) ->
                DataDictionaryGroupResponse(
                    group = group,
                    items = entries.map { DataDictionaryItemResponse.from(it) },
                )
            }
            .sortedBy { it.group }
}