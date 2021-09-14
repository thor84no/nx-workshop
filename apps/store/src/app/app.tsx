import styles from './app.module.scss';

import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import { Header } from '@bg-hoard/store/ui-shared';
import { formatRating } from '@bg-hoard/store/util-formatters';

import { Route, Link } from 'react-router-dom';

import { StoreFeatureGameDetail } from '@bg-hoard/store/feature-game-detail';
import { makeStyles } from '@material-ui/core/styles';
import { useEffect, useState } from 'react';

const useStyles = makeStyles(() => ({
  cardLink: {
    textDecoration: 'none',
  },
}));

export const App = () => {
  const classes = useStyles();
  const [state, setState] = useState<{
    data: any[];
    loadingState: 'success' | 'error' | 'loading';
  }>({
    data: [],
    loadingState: 'success',
  });

  useEffect(() => {
    setState((state) => ({
      ...state,
      loadingState: 'loading',
    }));
    fetch('/api/games')
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
  }, []);

  return (
    <>
      <Link className={classes.cardLink} to={'/'}><Header title={'Board Game Hoard'} /></Link>
      <div className={styles.container}>
        <div className={styles['games-layout']}>
          {state.loadingState === 'loading' ? (
            'Loading...'
          ) : state.loadingState === 'error' ? (
            <div>Error retrieving data</div>
          ) : (
            state.data.map((x) => (
              <Link
                key={x.id}
                to={`/game/${x.id}`}
                className={classes.cardLink}
              >
                <Card className={styles['game-card']}>
                  <CardActionArea>
                    <CardMedia
                      className={styles['game-card-media']}
                      image={x.image}
                      title={x.name}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="h2">
                        {x.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        component="p"
                      >
                        {x.description}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        component="p"
                        className={styles['game-rating']}
                      >
                        <strong>Rating:</strong> {formatRating(x.rating)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* START: routes */}
      <Route path="/game/:id" component={StoreFeatureGameDetail} />
      {/* END: routes */}
    </>
  );
};

export default App;
