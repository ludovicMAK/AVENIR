export type ownerIdInput = {
    id: string
}
export type CreateAccountRequest = {
    token: string;
    accountType: string;
    accountName: string;
    authorizedOverdraft: boolean;
    overdraftLimit: number;
    overdraftFees: number;
    idOwner: string;
};
export type CloseOwnAccountRequest = {
  idAccount: string;
  token: string;
  userId: string;
};
export type UpdateNameAccountRequest = {
  idAccount: string;
  newAccountName: string;
  token: string;
  idOwner: string;
};

