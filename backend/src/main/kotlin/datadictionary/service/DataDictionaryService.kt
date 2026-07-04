package datadictionary.service

import datadictionary.dto.response.DataDictionaryGroupResponse

interface DataDictionaryService {
    fun getAllGroups(): List<DataDictionaryGroupResponse>
    fun getGroup(groupName: String): DataDictionaryGroupResponse
}