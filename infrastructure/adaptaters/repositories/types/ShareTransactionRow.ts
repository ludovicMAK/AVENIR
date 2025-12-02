export type ShareTransactionRow = {
    id: string
    share_id: string
    buy_order_id: string
    sell_order_id: string
    buyer_id: string
    seller_id: string
    price_executed: number
    quantity: number
    date_executed: Date
    buyer_fee: number
    seller_fee: number
}
