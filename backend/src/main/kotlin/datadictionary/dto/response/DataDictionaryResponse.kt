package datadictionary.dto.response

data class DataDictionaryItem(
    val code: String,
    val label: String,
    val description: String?,
    val displayOrder: Int,
)

data class DataDictionaryGroupResponse(
    val group: String,
    val items: List<DataDictionaryItem>,
)