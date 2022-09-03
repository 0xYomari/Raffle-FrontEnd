import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
   const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
   const chainId = parseInt(chainIdHex)
   const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
   const [entranceFee, setEntranceFee] = useState("0")
   const [numPlayers, setNumPlayer] = useState("0")
   const [recentWinner, setRecentWinner] = useState("0")

   const dispatch = useNotification()

   const {
      runContractFunction: enterRaffle,
      isLoading,
      isFetching,
   } = useWeb3Contract({
      abi: abi,
      contractAddress: raffleAddress,
      functionName: "enterRaffle",
      params: {},
      msgValue: entranceFee,
   })

   const { runContractFunction: getEntranceFee } = useWeb3Contract({
      abi: abi,
      contractAddress: raffleAddress,
      functionName: "getEntranceFee",
      params: {},
   })

   const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
      abi: abi,
      contracAddress: raffleAddress,
      functionName: "getNumberOfPlayers",
      params: {},
   })
   const { runContractFunction: getRecentWinner } = useWeb3Contract({
      abi: abi,
      contracAddress: raffleAddress,
      functionName: "getRecentWinner",
      params: {},
   })

   async function UpdateUI() {
      const entranceFeeFromCall = (await getEntranceFee()).toString()
      const numPlayersFromCall = await getNumberOfPlayers()
      const recentWinnerFromCall = await getRecentWinner()
      setEntranceFee(entranceFeeFromCall)
      setNumPlayer(numPlayersFromCall)
      setRecentWinner(recentWinnerFromCall)
   }
   useEffect(() => {
      if (isWeb3Enabled) {
         UpdateUI()
      }
   }),
      [isWeb3Enabled]

   const handleSuccess = async (tx) => {
      await tx.wait(1)
      handleNewNotification(tx)
      UpdateUI()
   }

   const handleNewNotification = function () {
      dispatch({
         type: "info",
         message: "Transaction Complete!",
         title: "Tx Notification",
         position: "topR",
         icon: "bell",
      })
   }
   return (
      <div className="p-5">
         hello from lottery entrance!
         {raffleAddress ? (
            <div>
               <button
                  className="bg-blue-500 hover:bg-blue-700 text-white fond-bold py-2 px-4 rounded ml-auto"
                  onClick={async () => {
                     await enterRaffle({
                        onSuccess: handleSuccess,
                        onError: (error) => console.log(error),
                     })
                  }}
                  disabled={isLoading || isFetching}
               >
                  {isLoading || isFetching ? (
                     <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                  ) : (
                     <div>Enter Raffle</div>
                  )}
               </button>
               <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
               <div>Number of Players: {numPlayers}</div>
               <div>Recent Winner: {recentWinner}</div>
            </div>
         ) : (
            <div>No Raffle Address Detected</div>
         )}
      </div>
   )
}
