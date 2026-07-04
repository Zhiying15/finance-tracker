package com.finance.datadictionary.controller

import com.finance.datadictionary.dto.response.DataDictionaryGroupResponse
import com.finance.datadictionary.service.DataDictionaryService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/data-dictionary")
class DataDictionaryController(
    private val service: DataDictionaryService,
) {
    // GET /api/data-dictionary
    // Prefetch all groups in one call — use on app init to populate all dropdowns
    @GetMapping
    fun getAllGroups(): ResponseEntity<List<DataDictionaryGroupResponse>> =
        ResponseEntity.ok(service.getAllGroups())

    // GET /api/data-dictionary/{group}
    // Single group — use for lazy-loaded individual dropdowns
    // e.g. GET /api/data-dictionary/BUDGET_TYPE
    @GetMapping("/{group}")
    fun getGroup(
        @PathVariable group: String,
    ): ResponseEntity<DataDictionaryGroupResponse> =
        ResponseEntity.ok(service.getGroup(group))
}