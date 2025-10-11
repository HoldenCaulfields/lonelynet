import { useState, useEffect } from "react";

type Todo = {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
}

const useFetch = (url: string) => {
    const [data, setData] = useState<Todo[] | null>(null);

    useEffect(() => {
        fetch(url)
            .then((res) => res.json())
            .then((data) => setData(data))
            .catch((err) => console.error(err));
    }, [url]);

    return [data];
}

export default useFetch;