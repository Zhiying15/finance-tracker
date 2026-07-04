package datadictionary.service.impl

import common.constants.DataDictionaryConstants
import datadictionary.dto.response.DataDictionaryGroupResponse
import datadictionary.dto.response.DataDictionaryItem
import entity.DataDictionary
import common.exception.AppException
import datadictionary.service.DataDictionaryService
import datadictionary.repository.DataDictionaryRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DataDictionaryServiceImpl(
    private val repository: DataDictionaryRepository,
) : DataDictionaryService {
    // Valid group names — prevents arbitrary string querying
    private val validGroups = setOf(
        DataDictionaryConstants.TRANSACTION_STATUS,
        DataDictionaryConstants.IMPORT_REVIEW_STATUS,
        DataDictionaryConstants.TRANSACTION_FLOW,
        DataDictionaryConstants.RULE_TYPE,
        DataDictionaryConstants.ACCOUNT_CATEGORY,
        DataDictionaryConstants.ASSET_CLASS,
        DataDictionaryConstants.BUDGET_TYPE,
        DataDictionaryConstants.RESPONSE_CODE,
    )

    @Transactional(readOnly = true)
    override fun getGroup(groupName: String): DataDictionaryGroupResponse {
        val upperGroup = groupName.uppercase()

        if (upperGroup !in validGroups) {
            throw AppException.NotFound("Unknown data dictionary group: $groupName")
        }

        val items = repository
            .findAllByGroupNameAndIsActiveTrueOrderByDisplayOrderAsc(upperGroup)
            .map { it.toItem() }

        return DataDictionaryGroupResponse(group = upperGroup, items = items)
    }

    @Transactional(readOnly = true)
    override fun getAllGroups(): List<DataDictionaryGroupResponse> =
        repository
            .findAllByIsActiveTrueOrderByGroupNameAscDisplayOrderAsc()
            .groupBy { it.groupName }
            .map { (group, entries) ->
                DataDictionaryGroupResponse(
                    group = group,
                    items = entries.map { it.toItem() },
                )
            }
            .sortedBy { it.group }

    private fun DataDictionary.toItem() = DataDictionaryItem(
        code = code,
        label = label,
        description = description,
        displayOrder = displayOrder,
    )
}