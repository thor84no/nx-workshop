import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import styles from './store-feature-game-detail.module.scss';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import CardMedia from '@material-ui/core/CardMedia';
import { formatRating } from '@bg-hoard/store/util-formatters';
import { Game } from '@bg-hoard/util-interface';

type TParams = { id: string };

/* eslint-disable-next-line */
export interface StoreFeatureGameDetailProps
  extends RouteComponentProps<TParams> {}

export const StoreFeatureGameDetail = (props: StoreFeatureGameDetailProps) => {
  const [state, setState] = useState<{
    data: Game | null;
    loadingState: 'success' | 'error' | 'loading';
  }>({
    data: null,
    loadingState: 'success',
  });

  useEffect(() => {
    setState((state) => ({
      ...state,
      loadingState: 'loading',
    }));
    const gameId = props.match.params.id;
    fetch(`/api/games/${gameId}`)
      .then((x) => x.json())
      .then((res) => {
        setState((state) => ({
          ...state,
          data: res,
          loadingState: 'success',
        }));
      })
      .catch(() => {
        setState((state) => ({
          ...state,
          loadingState: 'error',
        }));
      });
  }, [props.match.params.id]);

  return (
    <div className={styles['container']}>
      {state.loadingState === 'loading' ? (
        'Loading...'
      ) : state.loadingState === 'error' ? (
        <div>Error fetching data</div>
      ) : state.data == null ? (
        ''
      ) : (
        <Card>
          <CardHeader title={state.data.name} />
          {state.data.image ? (
            <CardMedia
              className={styles['game-card-media']}
              image={state.data.image}
              title={state.data.name}
            />
          ) : null}
          <CardContent>
            <Typography variant="body2" color="textSecondary" component="p">
              {state.data.description}
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              component="p"
              className={styles['game-rating']}
            >
              <strong>Price:</strong> ${state.data.price?.toFixed(2)}
              <br />
              <strong>Rating:</strong>{' '}
              {state.data.rating ? formatRating(state.data.rating) : '-'}
            </Typography>
          </CardContent>
          <CardActions>
            <Button variant="contained" color="primary">
              Buy
            </Button>
            <Button variant="contained">Share</Button>
          </CardActions>
        </Card>
      )}
    </div>
  );
};

export default StoreFeatureGameDetail;
