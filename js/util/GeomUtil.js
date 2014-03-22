lib.GeomUtil = {

	centerOfMass: function(points) {

		var x = 0,
			y = 0,
			n = points.length,
			i = n,
			pt;

		while (i--) {
			pt = points[i];
			x += pt.x;
			y += pt.y;
		}

		x /= n;
		y /= n;

		return {
			x: x,
			y: y
		};
	},

	distance: function(xa, ya, xb, yb) {
		return Math.sqrt((xa - xb) * (xa - xb) + (ya - yb) * (ya - yb));
	},

	cartesianToPolar: function(p) {
		return {
			radius: Math.sqrt(p.x * p.x + p.y * p.y),
			angle: Math.atan2(p.y, p.x)
		}
	},

	getSymmetric: function(ofPt, centerPt) {
		return {
			x: -ofPt.x + 2 * centerPt.x,
			y: -ofPt.y + 2 * centerPt.y
		}
	},

	// segment
	distanceToSegment: function(segStartX, segStartY, segEndX, segEndY, pointX, pointY) {

	},

	findIntersection: function(p0, p1, p2, p3) {

		var s10_x = p1.x - p0.x,
			s10_y = p1.y - p0.y,
			s32_x = p3.x - p2.x,
			s32_y = p3.y - p2.y,
			denom = s10_x * s32_y - s32_x * s10_y;

		if (denom == 0) return null;

		var denom_is_positive = denom > 0

		var s02_x = p0.x - p2.x,
			s02_y = p0.y - p2.y,
			s_numer = s10_x * s02_y - s10_y * s02_x;

		if ((s_numer < 0) == denom_is_positive) return null;

		var t_numer = s32_x * s02_y - s32_y * s02_x;

		if ((t_numer < 0) == denom_is_positive) return null;

		if (((s_numer > denom) == denom_is_positive) || ((t_numer > denom) == denom_is_positive)) return null;

		var t = t_numer / denom;

		return {
			x: p0.x + (t * s10_x),
			y: p0.y + (t * s10_y)
		}
	},

	// port from insomnia
	douglasPeuckerSimplification: function(points, epsilon) {

		// Trouve le point le plus éloigné du segment
		var dmax = 0,
			index = 0,
			dist = lib.GeomUtil.distanceToSegment,
			i = 2,
			d = 0,
			len = points.length;

		for (; i < len; ++i) {
			d = dist([points[1], points[len - 1]], PointList[i]); // use bind
			if (d > dmax) {
				index = i
				dmax = d
			}
		}

		/*
		// Si la distance dmax est supérieure au seuil, on simplifie
		  if dmax >= epsilon
		    // Appel récursif de la fonction
		    recResults1[] = DouglasPeucker(PointList[1…index], epsilon)
		    recResults2[] = DouglasPeucker(PointList[index…end], epsilon)
		  
		    // Construit la liste des résultats à partir des résultats partiels
		    ResultList[] = {recResults1[1…end-1] recResults2[1…end]}

		  else
		    // Tous les points sont proches → renvoie un segment avec les extrémités
		    ResultList[] = {PointList[1], PointList[end]}
		  end
		 
		  // Renvoie le nouveau résultat
		  return ResultList[]
		  */
	}
}