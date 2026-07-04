package account.dto.response

import entity.AccountType

data class AccountTypeResponse(
    val id: Int,
    val name: String,
    val category: String,
    val assetClass: String,
) {
    companion object {
        fun from(entity: AccountType) = AccountTypeResponse(
            id = entity.id,
            name = entity.name,
            category = entity.category.name,
            assetClass = entity.assetClass.name,
        )
    }
}
