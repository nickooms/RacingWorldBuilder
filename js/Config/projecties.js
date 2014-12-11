function Lambert_LatLong_Hayford(x, y) {
    a = 6378388;
    f = 297;
    lambda0 = 4.35693972;
    p = .7716421928;
    k = 11565915.812935;
    alfa = .00813847;
    delta_x = .01256;
    delta_y = 88.4378;

    lambda = 0;
    rho1 = 0;
    xx = 0;
    yy = 0;

    f = 1 / f;
    e = 2 * f - f * f;

    with (Math) {
        e = sqrt(e);
        grad_rad = PI / 180
        rad_grad = 180 / PI
        alfa = alfa * grad_rad
        lambda0 = lambda0 * grad_rad

        x1 = x - delta_x - 150000
        y1 = -y + delta_y + 5400000
        xx = x1 / y1

        xx = atan(xx)
        phi = xx + alfa
        lambda = lambda0 + phi / p
        lambda = lambda * rad_grad

        r = x1 * x1 + y1 * y1
        r = sqrt(r)

        xx = r / k
        xx = log(xx) / p
        xx = exp(xx)
        psi = 2 * atan(xx)
        rho = PI / 2 - psi

        while (rho != rho1) {
            rho = rho1
            yy = (1 - e * sin(rho)) / (1 + e * sin(rho))
            yy = e / 2 * log(yy)
            yy = xx * exp(yy)
            yy = atan(yy)
            rho1 = (PI / 2) - (2 * yy)
        }

        rho = rho * rad_grad
        ll = rho
        bb = lambda

        f = ll
        l = bb

        ff = (floor(f * 1000000)) / 1000000
        ll = (floor(l * 1000000)) / 1000000
        //f1 f2 f3 = graden minuten seconden, f4 is decimaal idem voor l

    }
    output = new Array();
    output[0] = ff;
    output[1] = ll;
    return output;
}
function LatLong_Lambert_Hayford(phi, lambda) {

    xphi = 50.6795725
    xlambda = 5.8073703

    a = 6378388
    f = 297
    lambda0 = 4.35693972
    p = 0.7716421928
    k = 11565915.812935
    alfa = 0.00813847
    delta_x = 0.01256
    delta_y = 88.4378

    rho1 = 0
    xx = 0
    yy = 0

    f = 1 / f
    e = 2 * f - f * f

    with (Math) {
        e = sqrt(e)
        grad_rad = PI / 180
        rad_grad = 180 / PI
        alfa = alfa * grad_rad
        lambda0 = lambda0 * grad_rad
        phi = phi * grad_rad
        lambda = lambda * grad_rad

        xx = (1 + e * sin(phi)) / (1 - e * sin(phi))
        yy = e / 2
        xx = pow(xx, yy)

        yy = PI / 4 - phi / 2
        yy = tan(yy)
        tanhp = yy * xx

        r = k * pow(tanhp, p)


        xx = p * (lambda - lambda0) - alfa
        x = 150000 + delta_x + r * sin(xx)
        y = 5400000 + delta_y - r * cos(xx)
    }
    output = new Array();
    output[0] = x;
    output[1] = y;
    return output;

}

function hayford24_geograhic2geocentric(phi, lambda) {
    a = 6378388;
    b = 6356911.946;
    f = 297;
    e2 = 0.006768170197;
    e2cal = ((a * a) - (b * b)) / (a * a);
    e2 = e2cal;
    fcal = (a - b) / a;
    fcal = 1 / fcal;
    grad_rad = Math.PI / 180;
    rad_grad = 180 / Math.PI;
    phi = phi * grad_rad;
    lambda = lambda * grad_rad;
    N = a / (Math.sqrt(1 - (e2 * Math.sin(phi) * Math.sin(phi))));

    X = N * Math.cos(phi) * Math.cos(lambda);
    Y = N * Math.cos(phi) * Math.sin(lambda);
    Z = (N * (1 - e2) * Math.sin(phi));
    output = new Array();
    output[0] = X;
    output[1] = Y;
    output[2] = Z;
    return output;
}

function hayford24_geocentric2geograhic(X, Y, Z) {
    a = 6378388;
    b = 6356911.946;
    f = 297;
    e2 = 0.006768170197;
    e2cal = ((a * a) - (b * b)) / (a * a);
    e2 = e2cal;
    fcal = (a - b) / a;
    fcal = 1 / fcal;
    grad_rad = Math.PI / 180;
    rad_grad = 180 / Math.PI;
    lambda = Math.atan(Y / X);
    r = Math.sqrt((X * X) + (Y * Y));
    nsinphi = Z;
    phi0 = -1;
    for (i = 0; i < 10; i++) {
        phi = Math.atan((Z / r) + ((e2 * nsinphi) / r));
        if (phi == phi0) break;
        phi0 = phi;
        N = a / Math.sqrt((1 - e2 * Math.sin(phi) * Math.sin(phi)));
        nsinphi = N * Math.sin(phi);
    }
    h = (r / Math.cos(phi)) - N;
    phi = phi * rad_grad;
    lambda = lambda * rad_grad;
    output = new Array();
    output[0] = phi;
    output[1] = lambda;
    output[2] = h;
    return output;
}

function grs80_geograhic2geocentric(phi, lambda) {
    a = 6378137;
    b = 6356752.3142451793;
    f = 298.25722356300003;

    e2cal = ((a * a) - (b * b)) / (a * a);
    e2 = e2cal;
    fcal = (a - b) / a;
    fcal = 1 / fcal;
    grad_rad = Math.PI / 180;
    rad_grad = 180 / Math.PI;
    phi = phi * grad_rad;
    lambda = lambda * grad_rad;
    N = a / (Math.sqrt(1 - (e2 * Math.sin(phi) * Math.sin(phi))));

    X = N * Math.cos(phi) * Math.cos(lambda);
    Y = N * Math.cos(phi) * Math.sin(lambda);
    Z = (N * (1 - e2) * Math.sin(phi));
    output = new Array();
    output[0] = X;
    output[1] = Y;
    output[2] = Z;
    return output;
}

function grs80_geocentric2geograhic(X, Y, Z) {
    a = 6378137;
    b = 6356752.3142451793;
    f = 298.25722356300003;
    e2cal = ((a * a) - (b * b)) / (a * a);
    e2 = e2cal;
    fcal = (a - b) / a;
    fcal = 1 / fcal;
    grad_rad = Math.PI / 180;
    rad_grad = 180 / Math.PI;
    lambda = Math.atan(Y / X);
    r = Math.sqrt((X * X) + (Y * Y));
    nsinphi = Z;
    phi0 = -1;
    for (i = 0; i < 10; i++) {
        phi = Math.atan((Z / r) + ((e2 * nsinphi) / r));
        if (phi == phi0) break;
        phi0 = phi;
        N = a / Math.sqrt((1 - e2 * Math.sin(phi) * Math.sin(phi)));
        nsinphi = N * Math.sin(phi);
    }
    h = (r / Math.cos(phi)) - N;
    phi = phi * rad_grad;
    lambda = lambda * rad_grad;
    output = new Array();
    output[0] = phi;
    output[1] = lambda;
    output[2] = h;
    return output;
}
function datumshift_etrs892ed50(X, Y, Z)
//function datumshift_ed502etrs89(X,Y,Z)
{
    dx = 81.0703;
    dy = 89.3603;
    dz = 115.7526;
    rx = 0.48488;
    ry = 0.02436;
    rz = 0.41321;
    delta = 1 - 0.999999459355;

    rx = (rx * Math.PI) / (3600 * 180);
    ry = (ry * Math.PI) / (3600 * 180);
    rz = (rz * Math.PI) / (3600 * 180);



    XX = X + (delta * X + rz * Y - ry * Z) + dx;
    YY = Y + (-rz * X + delta * Y + rx * Z) + dy;
    ZZ = Z + (ry * X - rx * Y + delta * Z) + dz;
    output = new Array();
    output[0] = XX;
    output[1] = YY;
    output[2] = ZZ;
    return output;
}
function datumshift_ed502etrs89(X, Y, Z)
//function datumshift_etrs892ed50(X,Y,Z)
{
    dx = -81.0703;
    dy = -89.3603;
    dz = -115.7526;
    rx = -0.48488;
    ry = -0.02436;
    rz = -0.41321;
    delta = 1 - 0.999999459355;

    rx = (rx * Math.PI) / (3600 * 180);
    ry = (ry * Math.PI) / (3600 * 180);
    rz = (rz * Math.PI) / (3600 * 180);



    XX = X + (delta * X + rz * Y - ry * Z) + dx;
    YY = Y + (-rz * X + delta * Y + rx * Z) + dy;
    ZZ = Z + (ry * X - rx * Y + delta * Z) + dz;
    output = new Array();
    output[0] = XX;
    output[1] = YY;
    output[2] = ZZ;
    return output;
}

function datumshift_etrs892bd72(X, Y, Z) {
    dx = 99.059;
    dy = -53.322;
    dz = 112.486;
    rx = 0.419;
    ry = -0.83;
    rz = 1.885;
    delta = 0.999999;

    rx = (rx * Math.PI) / (3600 * 180);
    ry = (ry * Math.PI) / (3600 * 180);
    rz = (rz * Math.PI) / (3600 * 180);

    delta = 1 - 0.999999;

    XX = X + (delta * X + rz * Y - ry * Z) + dx;
    YY = Y + (-rz * X + delta * Y + rx * Z) + dy;
    ZZ = Z + (ry * X - rx * Y + delta * Z) + dz;
    output = new Array();
    output[0] = XX;
    output[1] = YY;
    output[2] = ZZ;
    return output;
}


function datumshift_bd722etrs89(X, Y, Z) {
    dx = -99.059;
    dy = 53.322;
    dz = -112.486;
    rx = -0.419;
    ry = 0.83;
    rz = -1.885;
    delta = 0.999999;

    rx = (rx * Math.PI) / (3600 * 180);
    ry = (ry * Math.PI) / (3600 * 180);
    rz = (rz * Math.PI) / (3600 * 180);

    delta = 1 - 0.999999;

    XX = X + (delta * X + rz * Y - ry * Z) + dx;
    YY = Y + (-rz * X + delta * Y + rx * Z) + dy;
    ZZ = Z + (ry * X - rx * Y + delta * Z) + dz;
    output = new Array();
    output[0] = XX;
    output[1] = YY;
    output[2] = ZZ;
    return output;
}

////////////////////////////////////////////////////////////////////////////////////////////////
// HELPFUNCTIES
////////////////////////////////////////////////////////////////////////////////////////////////
function deg2degmin(d) {
    dx = d;
    dd = Math.floor(dx);
    dx = (dx - dd) * 60000000;
    mm = Math.floor(dx) / 1000000;
    output = new Array();
    output[0] = dd;
    output[1] = mm;
    return output;
}

function deg2degminsec(d) {
    dx = d;
    dd = Math.floor(dx);
    dx = (dx - dd) * 60;
    mm = Math.floor(dx);
    ss = (dx - mm) * 600000;
    ss = Math.floor(ss) / 10000;
    output = new Array();
    output[0] = dd;
    output[1] = mm;
    output[2] = ss;
    return output;
}

function degmin2deg(d, m) {
    dd = d + m / 60;
    dd = Math.floor(dd * 100000000) / 100000000;
    return (dd);
}

function degmin2degminsec(d, m) {
    dd = d + m / 60;
    dd = Math.floor(dd * 100000000) / 100000000;
    return (deg2degminsec(dd));
}

function degminsec2deg(d, m, s) {
    dd = d + m / 60 + s / 3600
    dd = Math.floor(dd * 100000000) / 100000000;
    return (dd);
}

function degminsec2degmin(d, m, s) {
    dd = d + m / 60 + s / 3600;
    dd = Math.floor(dd * 100000000) / 100000000;
    return (deg2degmin(dd));
}



function dolambert(xlam,ylam) {
    var resultaat = Lambert_LatLong_Hayford(xlam, ylam);
    resultaat = hayford24_geograhic2geocentric(resultaat[0], resultaat[1]);
    resultaat = datumshift_bd722etrs89(resultaat[0], resultaat[1], resultaat[2]);
    resultaat = grs80_geocentric2geograhic(resultaat[0], resultaat[1], resultaat[2]);
    return resultaat;
}

function doetrs89geog(p,l) {
    var resultaat = grs80_geograhic2geocentric(p, l);
    var Xrem = resultaat[0]; Yrem = resultaat[1]; Zrem = resultaat[2];
    resultaat = datumshift_etrs892bd72(Xrem, Yrem, Zrem);
    resultaat = hayford24_geocentric2geograhic(resultaat[0], resultaat[1], resultaat[2]);
    resultaat = LatLong_Lambert_Hayford(resultaat[0], resultaat[1]);
    return resultaat;
}

function dolambertbounds(b) {
    bb = b.split(',');
    var minx = parseInt(bb[0]);
    var miny = parseInt(bb[1]);
    var maxx = parseInt(bb[2]);
    var maxy = parseInt(bb[3]);
    resultaat1 = dolambert(minx, miny);
    resultaat2 = dolambert(maxx, maxy);
    var res = resultaat1[1] + "," + resultaat1[0] + "," + resultaat2[1] + "," + resultaat2[0];
    return res;
}