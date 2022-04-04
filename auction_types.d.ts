type Auction = {
    id? : number,
    title? : string,
    categoryId? : number,
    sellerId? : number,
    sellerFirstName? : string,
    sellerLastName? : string,
    reserve? : number,
    numBids? : number,
    highestBid : number,
    endDate : string
}