import { Restaurant } from '../models/restaurant';

const RESTAURANT_NAMES = [
    ['مطعم البرج', 'Al Borg Restaurant'],
    ['بيتزا تايم', 'Pizza Time'],
    ['برجر هاوس', 'Burger House'],
    ['مطعم البيت المصري', 'Egyptian House Restaurant'],
    ['كافيه ومطعم النيل', 'Nile Cafe & Restaurant'],
    ['مشويات الشرق', 'Al Sharq Grill'],
    ['جريل هاوس', 'Grill House'],
    ['فود كورنر', 'Food Corner'],
    ['بيت الشاورما', 'Shawarma House'],
    ['مطعم زمان', 'Zaman Restaurant'],

    ['كشري التحرير', 'Koshary El Tahrir'],
    ['بيت الكباب', 'Kebab House'],
    ['برجر فاكتوري', 'Burger Factory'],
    ['بيتزا روما', 'Pizza Roma'],
    ['مطعم السلطان', 'Al Sultan Restaurant'],
    ['أكل بيتي', 'Home Food'],
    ['مشويات النخيل', 'Palm Grill'],
    ['مطعم البحر', 'Sea Restaurant'],
    ['سوشي هاوس', 'Sushi House'],
    ['باستا كورنر', 'Pasta Corner'],

    ['فرايد تشيكن', 'Fried Chicken'],
    ['تشكن هت', 'Chicken Hut'],
    ['مطعم الشيف', 'Chef Restaurant'],
    ['ركن الشاورما', 'Shawarma Corner'],
    ['بيت الفطير', 'Feteer House'],
    ['مطعم زمانا', 'Zamana Restaurant'],
    ['برجر لاب', 'Burger Lab'],
    ['بيتزا بلس', 'Pizza Plus'],
    ['مطعم السرايا', 'Al Saraya Restaurant'],
    ['كافيه روما', 'Roma Cafe'],

    ['مطعم المذاق', 'Al Mazaq Restaurant'],
    ['كبابجي', 'Kababgy'],
    ['مطعم الأصالة', 'Al Asala Restaurant'],
    ['بيت المشويات', 'Grill House'],
    ['فود لاند', 'Food Land'],
    ['مطعم الحبايب', 'Al Habayeb Restaurant'],
    ['كافيه جاردن', 'Garden Cafe'],
    ['مطعم الواحة', 'Al Waha Restaurant'],
    ['مطعم المدينة', 'Al Madina Restaurant'],
    ['مطعم الريف', 'Al Reef Restaurant'],

    ['بيت المكرونة', 'Pasta House'],
    ['برجر تاون', 'Burger Town'],
    ['بيتزا هوم', 'Pizza Home'],
    ['مطعم الفارس', 'Al Fares Restaurant'],
    ['كافيه مون', 'Moon Cafe'],
    ['مطعم السعادة', 'Al Saada Restaurant'],
    ['مطعم اللؤلؤة', 'Al Loeloa Restaurant'],
    ['مطعم النخبة', 'Elite Restaurant'],
    ['مذاق الشرق', 'Taste of East'],
    ['مطعم الإسكندرية', 'Alexandria Restaurant']
];

const RESTAURANT_IMAGES = [
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80',
    'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=800&q=80',
];

const FIELDS = [
    ['مطاعم ومأكولات', 'Restaurants & Food'],
    ['بيتزا ومأكولات إيطالية', 'Pizza & Italian Food'],
    ['برجر ووجبات سريعة', 'Burgers & Fast Food'],
    ['مشويات', 'Grills'],
    ['مأكولات مصرية', 'Egyptian Food'],
    ['مطاعم وكافيهات', 'Restaurants & Cafes'],
    ['شاورما', 'Shawarma'],
    ['مأكولات بحرية', 'Seafood'],
];

const AREAS = [
    ['سموحة', 'Smouha'],
    ['ستانلي', 'Stanley'],
    ['لوران', 'Louran'],
    ['ميامي', 'Miami'],
    ['كفر عبده', 'Kafr Abdo'],
    ['العصافرة', 'Asafra'],
    ['سيدي جابر', 'Sidi Gaber'],
    ['محطة الرمل', 'Raml Station'],
    ['جليم', 'Gleem'],
    ['رشدي', 'Roushdy'],
];

export const MOCK_RESTAURANTS: Restaurant[] = RESTAURANT_NAMES.map(
    ([clientName, clientName_En], index) => {

        const field = FIELDS[index % FIELDS.length];
        const area = AREAS[index % AREAS.length];

        return {
            id: index + 1,

            clientName,
            clientName_En,

            government_Ar: 'الإسكندرية',
            government_En: 'Alexandria',

            city_Ar: 'الإسكندرية',
            city_En: 'Alexandria',

            address: `${area[0]}، الإسكندرية`,
            address_En: `${area[1]}, Alexandria`,

            field_Ar: field[0],
            field_En: field[1],

            visitsCount: 300 + (index * 137) % 3000,

            pdfURL: '#',

            logoURL: RESTAURANT_IMAGES[index % RESTAURANT_IMAGES.length],

            rate: Number((4 + ((index * 7) % 10) / 10).toFixed(1)),

            isSponser: index % 7 === 0,

            serial: `REST-${String(index + 1).padStart(4, '0')}`,

            fromTime: index % 3 === 0 ? '10:00' : '11:00',
            toTime: index % 4 === 0 ? '00:00' : '23:00',

            latitude: 31.20 + (index % 10) * 0.005,
            longitude: 29.90 + (index % 10) * 0.006,

            isOpen: index % 6 !== 0,
            statusOpen: index % 6 !== 0 ? 1 : 0
        };
    }
);

export const MOCK_RESTAURANT_PAGES: Restaurant[][] = [
    MOCK_RESTAURANTS.slice(0, 17),
    MOCK_RESTAURANTS.slice(17, 34),
    MOCK_RESTAURANTS.slice(34, 50),
];