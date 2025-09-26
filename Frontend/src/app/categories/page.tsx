import api from '@/lib/api';

export default async function Home() {
  // Esta parte corre en el servidor (Server Component)
    const { data } = await api.get('/categories');
    return (
    <main>
        <h1>Categorías</h1>
        <ul>
        {data.categories.map((c: any) => (
            <li key={c._id}>{c.name}</li>
        ))}
        </ul>
    </main>
    );
}