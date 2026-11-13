export default function FicheHotel({ hotel }) {
    return (
        <article className="max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-bold text-slate-800">{hotel.name}</h2>
                <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                    ★ {hotel.note}
                </span>
            </div>

            <p className="mt-1 text-sm font-medium uppercase tracking-wide text-blue-600">
                {hotel.ville}
            </p>

            <p className="mt-4 leading-relaxed text-slate-600">{hotel.description}</p>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-500">{hotel.adresse}</p>
                <p className="text-xl font-semibold text-blue-700">
                    {hotel.prix} €
                    <span className="text-sm font-normal text-slate-500"></span>
                </p>
            </div>
        </article>
    );
}