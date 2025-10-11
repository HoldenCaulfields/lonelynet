
import React from 'react';
import { useState } from 'react';

export default function FavColor() {
    const [color, setColor] = useState('red');
    const arr = ['red', 'blue', 'green', 'yellow'];

    return (
        <div>
            <h2 className='h22'>my favorite color is {color}</h2>

            {arr.map((item, key) => (
                <button onClick={() => setColor(item)} key={key}>{item}</button>
            ))}

            
        </div>
    );
}