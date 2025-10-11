import { useState, useEffect } from "react";
import useFetch from "./useFetch";


const Fetch = () => {

    const [data] = useFetch("https://jsonplaceholder.typicode.com/todos");

    return (
        <>
            <h2>fetch data from jsonplaceholer</h2>
            {data && data.map((item) => {
                return <p key={item.id}>{item.title}</p>;
            })}
        </>
    );
}

export default Fetch;