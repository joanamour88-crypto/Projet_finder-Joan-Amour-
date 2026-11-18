import { useState } from "react";
import FicheHotel from './composants/FicheHotel.jsx';
import ListeChambre from './composants/ListeChambre.jsx';
import DetailChambre from './composants/DetailChambre.jsx';
import Accueil from './pages/Accueil.jsx';
import Connexion from './pages/Connexion.jsx';
// import Inscription from './pages/Inscription';
// import MesReservations from './pages/MesReservations.jsx';
import Recherche from './pages/Recherche.jsx';
// import RouteProtegee from './RoutesProtegee.jsx'
import {BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';

const lienClasse = ({ isActive }) =>
  `relative rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A8B7A] ${
    isActive
      ? "text-[#F7F4EF] after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded after:bg-[#C86D51]"
      : "text-[#EBE5DC]/70 hover:text-[#F7F4EF]"
  }`;

const boutonClasse = ({ isActive }) =>
  `rounded-md border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A8B7A] ${
    isActive
      ? "border-[#C86D51] bg-[#C86D51] text-[#2B2A29]"
      : "border-[#C86D51] text-[#F7F4EF] hover:bg-[#C86D51] hover:text-[#2B2A29]"
  }`;

export default function App() {

  return (
    <BrowserRouter>
      <nav className="border-b border-[#7A8B7A]/40 bg-[#2B2A29]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-1 px-6 py-3">
          <Link to="/" className="mr-4 flex items-center">
            <img src="/logo-finder-f-clair.svg" alt="Finder" className="h-9" />
          </Link>

          <NavLink to="/" end className={lienClasse}>Accueil</NavLink>
          <NavLink to="/recherche" className={lienClasse}>Rechercher</NavLink>
          <NavLink to="/mes-reservations" className={lienClasse}>Mes réservations</NavLink>

          <div className="ml-auto flex items-center gap-2">
            <NavLink to="/connexion" className={lienClasse}>Connexion</NavLink>
            <NavLink to="/inscription" className={boutonClasse}>Inscription</NavLink>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Accueil />}/>
        <Route path="/connexion" element={<Connexion />}/>
        {/* <Route path="/inscription" element={<Inscription />}/> */}
        <Route path="/recherche" element={<Recherche />}/>
        {/* <Route path="/reserve/:id" element={<RouteProtegee><Reserver /></RouteProtegee>}/> 
        <Route path="/mes-reservations" element={<RouteProtegee><MesReservations /></RouteProtegee>}/> */}
        <Route path="*" element={<p>Page Introuvable</p>}/>
      </Routes>
    </BrowserRouter>
  );
}

