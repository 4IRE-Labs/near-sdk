import {
    Contract,
} from '../contract'

export class NEP4Standard extends Contract {
    transferFrom(owner_id: string, new_owner_id: string, token_id: number): Promise<void> {
        return this.call({
            methodName: 'transfer_from',
            args: {owner_id, new_owner_id, token_id},
        })
    }

    transfer(new_owner_id: string, token_id: number): Promise<void> {
        return this.call({
            methodName: 'transfer',
            args: {new_owner_id, token_id},
        })
    }

    grantAccess(escrow_account_id: string): Promise<void> {
        return this.call({
            methodName: 'grant_access',
            args: {escrow_account_id},
        })
    }

    checkAccess(account_id: string): Promise<boolean> {
        return this.call({
            methodName: 'check_access',
            args: {account_id},
        })
    }

    revokeAccess(escrow_account_id: string): Promise<boolean> {
        return this.call({
            methodName: 'revoke_access',
            args: {escrow_account_id},
        })
    }

    getTokenOwner(token_id: number): Promise<string> {
        return this.view({
            methodName: 'get_token_owner',
            args: {token_id},
        })
    }
}
