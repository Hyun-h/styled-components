import React, { useState, useEffect } from 'react';
import { Switch, Route, Link, useParams, useLocation, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';

import Chart from './Chart';
import Price from './Price';

const Container = styled.main`
    padding: 0 1.25rem;
    max-width: 30rem;
    margin: 0 auto;
`;

const Header = styled.header`
    height: 10vh;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Title = styled.h1`
    font-size: 3rem;
    color: ${(props) => props.theme.accentColor};
`;

const Loader = styled.span`
    display: inline-block;
    width: 100%;
    text-align: center;
`;

const Overview = styled.div`
    display: flex;
    justify-content: space-between;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 0.625rem 1.25rem;
    border-radius: 10px;
`;
const OverviewItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    span:first-child {
        font-size: 0.625rem;
        font-weight: 400;
        text-transform: uppercase;
        margin-bottom: 5px;
    }
`;
const Description = styled.p`
    margin: 1.25rem 0;
`;

const Tabs = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    margin: 25px 0px;
    gap: 10px;
`;

const Tab = styled.span<{ isActive: boolean }>`
    text-align: center;
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 400;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 7px 0px;
    border-radius: 10px;
    //styled-components 안에서 조건도 체크 가능하다!
    color: ${(props) => (props.isActive ? props.theme.accentColor : props.theme.textColor)};
    a {
        display: block;
    }
`;

//이제부터 들여야 하는 습관 : TS는 늘 설명을 해줘야 한다.
//interface로 설명해주기
interface RouteParams {
    coinId: string;
}

interface RouterState {
    name: string;
}

interface InfoData {
    id: string;
    name: string;
    symbol: string;
    rank: number;
    is_new: boolean;
    is_active: boolean;
    type: string;
    description: string;
    message: string;
    open_source: boolean;
    started_at: string;
    development_status: string;
    hardware_wallet: boolean;
    proof_type: string;
    org_structure: string;
    hash_algorithm: string;
    first_data_at: string;
    last_data_at: string;
}

interface PriceData {
    id: string;
    name: string;
    symbol: string;
    rank: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
    beta_value: number;
    first_data_at: string;
    last_updated: string;
    quotes: {
        USD: {
            ath_date: string;
            ath_price: number;
            market_cap: number;
            market_cap_change_24h: number;
            percent_change_1h: number;
            percent_change_1y: number;
            percent_change_6h: number;
            percent_change_7d: number;
            percent_change_12h: number;
            percent_change_15m: number;
            percent_change_24h: number;
            percent_change_30d: number;
            percent_change_30m: number;
            percent_from_price_ath: number;
            price: number;
            volume_24h: number;
            volume_24h_change_24h: number;
        };
    };
}

function Coin() {
    const [loading, setLoading] = useState(true);
    //TS : 그래서 const 어쩌구가 뭔데? 나 : <RouteParams> 이거야!
    //useParams : URL에서 변수의 정보를 가져다 줌
    const { coinId } = useParams<RouteParams>();
    //coins component에서 Link to로 전달된 object를 받아옴
    //코인의 name을 이미 가지고 있어서 API가 줄 때까지 기다릴 필요가 없어짐
    const { state } = useLocation<RouterState>();
    //ts는 info와 priceInfo를 빈 배열로 인식해서 설명해 줄 필요가 있음
    const [info, setInfo] = useState<InfoData>();
    const [priceInfo, setPriceInfo] = useState<PriceData>();

    //useRouteMatch 로 해당 루트와 일치하면 object를 내보냄
    const priceMatch = useRouteMatch('/:coinId/price');
    const chartMatch = useRouteMatch('/:coinId/chart');

    useEffect(() => {
        (async () => {
            //캡슐화
            const infoData = await (await fetch(`https://api.coinpaprika.com/v1/coins/${coinId}`)).json();
            const priceData = await (await fetch(`https://api.coinpaprika.com/v1/tickers/${coinId}`)).json();
            setInfo(infoData);
            setPriceInfo(priceData);
            setLoading(false);
        })();
        //hook의 최적의 성능을 위해서는 dependency(의존성)를 []안에 넣어줘야 함.
    }, [coinId]);

    return (
        <Container>
            <Header>
                <Title>{state?.name ? state.name : loading ? 'Loading...' : info?.name}</Title>
            </Header>
            {loading ? (
                <Loader>Loading...</Loader>
            ) : (
                <>
                    <Overview>
                        <OverviewItem>
                            <span>Rank:</span>
                            <span>{info?.rank}</span>
                        </OverviewItem>
                        <OverviewItem>
                            <span>Symbol:</span>
                            <span>${info?.symbol}</span>
                        </OverviewItem>
                        <OverviewItem>
                            <span>Open Source:</span>
                            <span>{info?.open_source ? 'Yes' : 'No'}</span>
                        </OverviewItem>
                    </Overview>
                    <Description>{info?.description}</Description>
                    <Overview>
                        <OverviewItem>
                            <span>Total Suply:</span>
                            <span>{priceInfo?.total_supply}</span>
                        </OverviewItem>
                        <OverviewItem>
                            <span>Max Supply:</span>
                            <span>{priceInfo?.max_supply}</span>
                        </OverviewItem>
                    </Overview>

                    <Tabs>
                        {/* 여기서 조건검사*/}
                        <Tab isActive={chartMatch !== null}>
                            <Link to={`/${coinId}/chart`}>Chart</Link>
                        </Tab>
                        <Tab isActive={priceMatch !== null}>
                            <Link to={`/${coinId}/price`}>Price</Link>
                        </Tab>
                    </Tabs>

                    {/* Nested Rountes를 쓰려면 최상단 루트에 꼭 path가 지정되어 있어야 함 */}
                    {/* Switch 설정을 해주고 Link 설정을 해줘야 함 */}
                    <Switch>
                        <Route path={`/:coinId/price`}>
                            <Price />
                        </Route>
                        <Route path={`/:coinId/chart`}>
                            <Chart />
                        </Route>
                    </Switch>
                </>
            )}
        </Container>
    );
}

export default Coin;
