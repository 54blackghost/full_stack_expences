 "use client"

import { useEffect, useState } from "react";
import api from "@/app/api"
import toast from "react-hot-toast";
import { Activity, ArrowDownCircle, ArrowUpCircle, PlusCircle, Trash, TrendingDown, TrendingUp, Wallet } from "lucide-react";

// creation du type qui represente chaque actions
 type Transaction = {
  id : string;
  text : string;
  amount : number;
  created_at : string
 }
 
 export default function Home() {
  
  //creation du tableau transaction
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [text, setText] = useState<string>("");
  const [amount, setAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false)
  //on charge tous les transactions
  const getTransactions = async () => {
    try {
      //appel de l'api
      const res = await api.get<Transaction[]>('transactions/')

      //on met les transaction recuperer dans le tableau creer
      setTransactions(res.data)
      toast.success("Transactions chargees")
    } catch (error) {
      console.error("Erreur chargement transactions", error);
      toast.error("Erreur chargement transactions")
    }
  }

    //supprimer une depense
  const deleteTransactions = async (id:string) => {
    try {
      //appel de l'api
      await  api.delete(`transactions/${id}/`)
      getTransactions()
      toast.success("Transactions supprimer")
    } catch (error) {
      console.error("Erreur suppression transactions", error);
      toast.error("Erreur suppression transactions")
    }
  }

  //ajouter une depense
  const addTransactions = async () => {
   if (!text || amount == "" || isNaN(Number(amount))){
    toast.error("Merci de remplir les champs")
    return
   } 
   setLoading(true)

    try {
      //appel de l'api
      const res = await api.post<Transaction>('transactions/', {
        text,
        amount : Number(amount)
      })
      getTransactions()
      const modal = document.getElementById('my_modal_3') as HTMLDialogElement
      if (modal) {
        modal.close()
      }
      toast.success("Transactions ajoute avec succes")
      setText("")
      setAmount("")
    } catch (error) {
      console.error("Erreur non ajout de la transactions", error);
      toast.error("Erreur non ajout de la transactions")
    } finally{
      setLoading(false)
    }
  }

  useEffect(() => {
       getTransactions()
  },[]);


  //calculs securiser
  const amounts = transactions.map((t) => Number(t.amount) || 0)
  const balance = amounts.reduce((acc, item)=> acc + item, 0) || 0 
  const income = 
    amounts.filter((a) => a > 0).reduce((acc, item)=> acc + item, 0) || 0
  
  const expense = 
    amounts.filter((a) => a < 0).reduce((acc, item)=> acc + item, 0) || 0
  
  const ratio = income > 0 ? Math.min((Math.abs(expense) / income) * 100, 100): 0 


  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("fr-FR",{
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  return(
    <div className="w-2/3 flex flex-col gap-4">
     
      <div className="flex justify-between rounded-2xl border-2 border-warning/10 border-dashed bg-warning/5 p-5" >


        <div className="flex flex-col gap-1">
        
            <div className="badge badge-soft">
              <Wallet className="w-4 h-4"/>
              Votre solde
            </div>
            
            <div className="stat-value">
              {balance.toFixed(2)} $
            </div>
        </div>



        <div className="flex flex-col gap-1">
        
            <div className="badge badge-soft badge-success">
              <ArrowUpCircle className="w-4 h-4"/>
              Revenus
            </div>
            
            <div className="stat-value">
              {income.toFixed(2)} $
            </div>
        </div>



        <div className="flex flex-col gap-1">
        
            <div className="badge badge-soft badge-error">
              <ArrowDownCircle className="w-4 h-4"/>
              Depenses
            </div>
            
            <div className="stat-value">
              {expense.toFixed(2)} $
            </div>
        </div>

      </div>

      <div className="rounded-2xl border-2 border-warning/10 border-dashed bg-warning/5 p-5">

        <div className="flex justify-between items-center mb-1">
            <div className="badge badge-soft badge-warning gapp-1">
              <Activity className="w-4 h-4"/>
              Depenses vs Revenus
            </div>
            <div>{ratio.toFixed(0)}%</div> 
        </div>

        <progress className="progress progress-warning w-full"
        value={ratio}
        max={100}
        >
        </progress>
      </div>

      {/* button   */}
      <button
          className="btn btn-warning"
          onClick={() => (document.getElementById('my_modal_3') as HTMLDialogElement).showModal()}
      >
       <PlusCircle className="w-4 h-4"/>
       Ajouter une transaction
      </button>
      <dialog id="my_modal_3" className="modal backdrop-blur">
        <div className="modal-box border-2 border-warning/10  border-dashed">
          <form method="dialog">
            {/**/}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">X</button>
          </form>
          <h3 className="font-bold text-lg">Ajouter une transaction</h3>
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="" className="label">Texte</label>
              <input 
              type="text" 
              name="text"
              value={text}
              onChange={(e)=> setText(e.target.value)}
              className="input w-full" 
              placeholder="Entrez le texte..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="" className="label">Montant (negatif - depense, positif - revenu)</label>
              <input 
              type="number" 
              name="amount"
              value={amount}
              onChange={(e)=> setAmount(
                e.target.value === "" ? "" : Number(e.target.value)
              )}
              className="input w-full" 
              placeholder="Entrez le montant..."
              />
            </div>

            <button 
            className="btn btn-warning"
            onClick={addTransactions}
            disabled={loading}>
              <PlusCircle className="w-4 h-4"/>
              Ajouter
            </button>
          </div>
        </div>
      </dialog>

      <div className="overflow-x-auto rounded-2xl border-2 border-warning/10 border-dashed bg-warning/5">
        <table className="table">
          {/* head*/}
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Montant</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, index) =>(
              <tr
              key={t.id}
              >
                  <th>{index + 1}</th>
                  <td>{t.text}</td>
                  <td className="font-semibold flex items-center gap-2">
                    {t.amount > 0 ? (
                      <TrendingUp className="text-success w-6 h-6"/>
                    ): (
                      <TrendingDown className="text-error w-6 h-6"/>
                    )}
                    {t.amount > 0 ? `+${t.amount}`: `${t.amount}`}
                  </td>
                  <td>
                    {formatDate(t.created_at)}
                  </td>
                  <td>
                    <button
                    onClick={()=> deleteTransactions(t.id )}
                    className="btn btn-sm btn-error btn-soft">
                      <Trash className="w-4 h-4"/>
                    </button>
                  </td>
              </tr>
            ))}
            
          </tbody>
        </table>
      </div>
    </div>
  );
}
 