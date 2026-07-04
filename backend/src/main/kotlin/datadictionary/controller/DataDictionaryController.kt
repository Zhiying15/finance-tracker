package datadictionary.controller

import datadictionary.dto.response.DataDictionaryGroupResponse
import datadictionary.service.DataDictionaryService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/data-dictionary")
class DataDictionaryController(
    private val service: DataDictionaryService,
) {
    // GET /api/data-dictionary
    // Returns all groups — useful for prefetching everything on app init
    @GetMapping
    fun getAllGroups(): ResponseEntity<List<DataDictionaryGroupResponse>> =
        ResponseEntity.ok(service.getAllGroups())

    // GET /api/data-dictionary/BUDGET_TYPE
    // Returns one group — use this for individual dropdowns
    @GetMapping("/{group}")
    fun getGroup(
        @PathVariable group: String,
    ): ResponseEntity<DataDictionaryGroupResponse> =
        ResponseEntity.ok(service.getGroup(group))
}