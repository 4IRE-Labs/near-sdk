import * as api from 'near-api-js'
import * as config from './config'
import * as util from './util'
import {
    toYocto,
} from './util'
import * as provider from 'near-api-js/lib/providers/provider'
import BN from 'bn.js'
import {
    fullAccessKey,
    Action,
    addKey as addKeyAction,
    createAccount as createAccountAction,
    deployContract as deployContractAction,
    functionCall as functionCallAction,
    transfer as transferAction,
} from 'near-api-js/lib/transaction'
import {
    AccountNetwork,
    isExistAccount,
    parseAccountNetwork,
} from './account'
import {
    AccountConnect,
    newAccountConnect,
    Outcome,
    transactionOutcome,
} from './index'
import {
    FunctionCallOptions,
} from 'near-api-js/lib/account'

const DEFAULT_FUNC_CALL_GAS = new BN('30000000000000')

export async function fetchContract(accountId: string, networkId?: string): Promise<Uint8Array> {
    const rpc = new api.providers.JsonRpcProvider(config.environment(networkId).nodeUrl)
    const result = await rpc.query<provider.ContractCodeView>({
        request_type: 'view_code',
        finality: 'final',
        account_id: accountId
    })
    return Buffer.from(result.code_base64, 'base64')
}

export interface DeployProps {
    init?: ChangeMethod,
    amount?: string,
    sender?: AccountNetwork,
}

export interface DeployResult<Type> {
    account: AccountConnect
    outcome: Outcome<Type>
}

/**
 * Options used to initiate a function call (especially a change function call)
 */
export interface ChangeMethod {
    /** The name of the method to invoke */
    methodName: string;
    /** named arguments to pass the method `{ field: any }` */
    args: Record<string, unknown>;
    /** max amount of gas that method call can use */
    gas?: string;
    /** amount of NEAR to send together with the call */
    attachedDeposit?: string;
    /** Metadata to send the NEAR Wallet if using it to sign transactions  */
    walletMeta?: string;
    /** Callback url to send the NEAR Wallet if using it to sign transactions */
    walletCallbackUrl?: string;
}

export interface ViewMethod {
    /** The name of the method to invoke */
    methodName: string;
    /** named arguments to pass the method `{ field: any }` */
    args: Record<string, unknown>;
}

export async function deployContract<Type>(
    contractAccount: AccountNetwork,
    code: Uint8Array,
    props?: DeployProps,
): Promise<DeployResult<Type>> {
    const isNotExistAccount = !await isExistAccount(contractAccount)
    const result = <DeployResult<Type>>{}
    props = props || <DeployProps>{}
    props.sender = props.sender || parseAccountNetwork()
    const account = await newAccountConnect(props.sender)

    const actionList: Action[] = []
    if (isNotExistAccount) {
        actionList.push(createAccountAction())
    }
    if (isNotExistAccount && props.amount) {
        const deposit = util.toYocto(props.amount)
        if (deposit.gtn(0)) {
            actionList.push(transferAction(deposit))
        }
    }
    if (isNotExistAccount) {
        const accessKey = fullAccessKey()
        actionList.push(addKeyAction(contractAccount.keyPair.publicKey, accessKey))
    } else {
        // TODO check keys
    }
    actionList.push(deployContractAction(code))
    if (props.init && props.init.methodName) {
        actionList.push(functionCallAction(
            props.init.methodName,
            props.init.args || {},
            parseGas(props.init.gas),
            parseDeposit(props.init.attachedDeposit),
        ))
    }
    result.outcome = await account.sendTransaction(contractAccount.accountId, actionList)
    result.account = await newAccountConnect(contractAccount)
    return result
}

function parseGas(gas: string): BN {
    return (gas ? toYocto(gas) : DEFAULT_FUNC_CALL_GAS)
}

function parseDeposit(deposit: string): BN {
    return (deposit ? toYocto(deposit) : new BN(0))
}

function createFunctionCallOptions(contractId: string, method: ChangeMethod): FunctionCallOptions {
    const {
        methodName,
        args,
        gas,
        attachedDeposit,
        walletMeta,
        walletCallbackUrl,
    } = method
    return <FunctionCallOptions>{
        contractId,
        methodName,
        args,
        gas: parseGas(gas),
        attachedDeposit: parseDeposit(attachedDeposit),
        walletMeta,
        walletCallbackUrl,
    }
}

export class Contract {
    protected account: AccountConnect
    protected contractId: string

    static async connect<Type>(
        c: new (account: AccountConnect, contractId?: string) => Type,
        contractId: string,
        sender?: AccountNetwork,
    ): Promise<Type> {
        sender = sender || parseAccountNetwork()
        const account = await newAccountConnect(sender)
        return new c(account, contractId)
    }

    constructor(account: AccountConnect, contractId?: string) {
        this.account = account
        this.contractId = contractId || account.accountId
    }

    async callRaw<Type>(props: ChangeMethod): Promise<Outcome<Type>> {
        const outcome = await this.account.functionCall(createFunctionCallOptions(this.contractId, props))
        return transactionOutcome<Type>(outcome)
    }

    async call<Type>(props: ChangeMethod): Promise<Type> {
        return (await this.callRaw<Type>(props)).value
    }

    async view<Type>(props: ViewMethod): Promise<Type> {
        const outcome = await this.account.viewFunction(this.contractId, props.methodName, props.args)
        return <Type><unknown>outcome
    }
}
