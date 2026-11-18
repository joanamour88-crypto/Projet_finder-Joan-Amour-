import { Link } from "react-router-dom";

const categories = [
    { nom: "Simple", capacite: "1 personne", texte: "Pour un séjour seul, pratique et au calme." },
    { nom: "Double", capacite: "2 personnes", texte: "Un grand lit ou deux lits séparés, au choix de l'hôtel." },
    { nom: "Familiale", capacite: "3 à 5 personnes", texte: "Assez d'espace pour voyager avec les enfants." },
    { nom: "Suite", capacite: "2 à 4 personnes", texte: "Un salon séparé et plus de confort pour les longs séjours." },
];

const etapes = [
    { titre: "Indiquez vos dates", texte: "Choisissez votre arrivée et votre départ, et le nombre de personnes." },
    { titre: "Filtrez les chambres", texte: "Limitez par prix, par catégorie ou par hôtel pour ne garder que l'utile." },
    { titre: "Consultez le détail", texte: "Ouvrez une chambre pour voir ses équipements et son prix avant de décider." },
];

// Palette : Lin #F7F4EF, Crème #EBE5DC, Charbon #2B2A29, Terracotta #C86D51, Vert sauge #7A8B7A
const boutonClasse =
    "inline-flex items-center rounded-md bg-[#C86D51] px-5 py-3 text-base font-medium text-[#2B2A29] shadow-sm transition-colors hover:bg-[#d98163] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A8B7A] focus-visible:ring-offset-2";

export default function Accueil() {
    return (
        <div className="min-h-screen bg-[#F7F4EF]">
            <div className="mx-auto max-w-5xl p-6">
                <section className="rounded-2xl bg-[#2B2A29] px-8 py-16 text-[#F7F4EF] sm:px-12">
                    <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
                        Trouvez la chambre qui correspond à votre séjour
                    </h1>
                    <p className="mt-4 max-w-xl text-lg text-[#EBE5DC]/80">
                        Finder compare les chambres disponibles de nos hôtels selon vos dates, votre budget et le nombre de voyageurs.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link to="/recherche" className={`${boutonClasse} focus-visible:ring-offset-[#2B2A29]`}>
                            Rechercher une chambre
                        </Link>
                    </div>
                </section>

                <section className="mt-14" aria-labelledby="titre-categories">
                    <h2 id="titre-categories" className="text-2xl font-bold text-[#2B2A29]">Quatre types de chambres</h2>
                    <p className="mb-6 mt-1 max-w-xl text-[#2B2A29]/70">
                        Chaque hôtel propose ses chambres dans l'une de ces catégories.
                    </p>
                    <dl className="grid gap-4 sm:grid-cols-2">
                        {categories.map(c => (
                            <div key={c.nom} className="rounded-lg border border-[#7A8B7A]/40 bg-[#EBE5DC] p-5">
                                <dt className="flex items-baseline justify-between">
                                    <span className="text-lg font-semibold text-[#2B2A29]">{c.nom}</span>
                                    <span className="text-sm text-[#2B2A29]/70">{c.capacite}</span>
                                </dt>
                                <dd className="mt-2 text-sm text-[#2B2A29]/80">{c.texte}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                <section className="mt-14" aria-labelledby="titre-etapes">
                    <h2 id="titre-etapes" className="mb-6 text-2xl font-bold text-[#2B2A29]">Comment ça marche</h2>
                    <ol className="space-y-5 border-l-2 border-[#7A8B7A]/50 pl-6">
                        {etapes.map((e, i) => (
                            <li key={e.titre} className="relative">
                                <span
                                    aria-hidden="true"
                                    className="absolute -left-[39px] top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#C86D51] text-sm font-semibold text-[#2B2A29]"
                                >
                                    {i + 1}
                                </span>
                                <h3 className="font-semibold text-[#2B2A29]">{e.titre}</h3>
                                <p className="mt-1 text-sm text-[#2B2A29]/80">{e.texte}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="mt-14 rounded-2xl bg-[#EBE5DC] px-8 py-10 text-center">
                    <h2 className="text-2xl font-bold text-[#2B2A29]">Prêt à partir ?</h2>
                    <p className="mx-auto mb-6 mt-2 max-w-md text-[#2B2A29]/70">
                        Lancez une recherche : vous pouvez affiner les critères à tout moment.
                    </p>
                    <Link to="/recherche" className={`${boutonClasse} focus-visible:ring-offset-[#EBE5DC]`}>
                        Rechercher une chambre
                    </Link>
                </section>
            </div>
        </div>
    );
}