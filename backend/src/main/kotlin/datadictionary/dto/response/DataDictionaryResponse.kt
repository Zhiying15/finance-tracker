package datadictionary.dto.response

import entity.DataDictionary

data class DataDictionaryItemResponse(
    val code: String,
    val label: String,
    val description: String?,
    val displayOrder: Int,
) {
    companion object {
        fun from(entity: DataDictionary) = DataDictionaryItemResponse(
            code         = entity.code,
            label        = entity.label,
            description  = entity.description,
            displayOrder = entity.displayOrder,
        )
    }
}

data class DataDictionaryGroupResponse(
    val group: String,
    val items: List<DataDictionaryItemResponse>,
)