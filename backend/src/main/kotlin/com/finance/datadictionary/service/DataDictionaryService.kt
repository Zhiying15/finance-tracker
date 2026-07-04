package com.finance.datadictionary.service

import com.finance.datadictionary.dto.response.DataDictionaryGroupResponse

interface DataDictionaryService {
    fun getAllGroups(): List<DataDictionaryGroupResponse>
    fun getGroup(groupName: String): DataDictionaryGroupResponse
}