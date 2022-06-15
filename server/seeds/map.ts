import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('map').del();

  // Inserts seed entries
  await knex('map').insert([
    {
      stars:
        '[{"x":0.34510770975056687,"y":0.17964180710895872},{"x":0.7555385487528344,"y":0.24891356554590363},{"x":0.7865287226001513,"y":0.6929632991160635},{"x":0.4819179894179894,"y":0.4744908301995448},{"x":0.12590891912320482,"y":0.7355920735387989}]',
      meteorites:
        '[{"x":0.31597883597883597,"y":0.3706986454748557},{"x":0.7029780801209372,"y":0.4310894092403974},{"x":0.5412244897959183,"y":0.6939668515139321}]',
      black_holes:
        '[{"x":0.5500037792894935,"y":0.19117821918711148},{"x":0.2612660619803477,"y":0.6902901197199711}]',
      black_hole_map: '[1,0]',
      name: 'easy',
    },
    {
      stars:
        '[{"x":0.3776095993953137,"y":0.25779456021730685},{"x":0.658032879818594,"y":0.18319420497751998},{"x":0.9233390022675738,"y":0.3839046845512322},{"x":0.7215249433106576,"y":0.39456187815691607},{"x":0.8417063492063492,"y":0.7071728905903085},{"x":0.5272694633408919,"y":0.833283014924234},{"x":0.383656462585034,"y":0.6041533524020315},{"x":0.21207671957671956,"y":0.744473068210202}]',
      meteorites:
        '[{"x":0.09904761904761904,"y":0.5873949154570938},{"x":0.24870748299319728,"y":0.10782120320132105},{"x":0.5382010582010581,"y":0.28188869876082373},{"x":0.8473469387755102,"y":0.10426880533275977},{"x":0.8178684807256236,"y":0.47549438259741345},{"x":0.5918669690098262,"y":0.6122617005370227},{"x":0.3598185941043084,"y":0.7703434056879996}]',
      black_holes:
        '[{"x":0.2378344671201814,"y":0.4309650753149978},{"x":0.45703325774754344,"y":0.1254588586187278},{"x":0.7230952380952381,"y":0.7204855016027419},{"x":0.7797845804988662,"y":0.2693309722954596},{"x":0.4766855631141345,"y":0.5179988230947491}]',
      black_hole_map: '[1,4,0,2,3]',
      name: 'normal',
    },
    {
      stars:
        '[{"x":0.2853949357520786,"y":0.14944642522618784},{"x":0.4320313681027967,"y":0.24891356554590363},{"x":0.6451832955404384,"y":0.09793665613204929},{"x":0.8621145124716554,"y":0.1920751996489232},{"x":0.7698998488284202,"y":0.44784784618533524},{"x":0.9157804232804233,"y":0.7338158746045181},{"x":0.6217517006802721,"y":0.5615245779792961},{"x":0.40708805744520027,"y":0.8030876330414631},{"x":0.31184996220710504,"y":0.5810627662563832},{"x":0.18410997732426304,"y":0.7231586809988343},{"x":0.05334656084656085,"y":0.7302634767359569},{"x":0.04049697656840514,"y":0.07662226892068162}]',
      meteorites:
        '[{"x":0.09375661375661375,"y":0.5571995335743228},{"x":0.4225547996976568,"y":0.08295441812139209},{"x":0.7649584278155707,"y":0.09005921385851465},{"x":0.9214210128495842,"y":0.07052102558142762},{"x":0.790657596371882,"y":0.6424570824197936},{"x":0.6115192743764172,"y":0.7863291960965254},{"x":0.4422071050642479,"y":0.482599178334536},{"x":0.2774300831443689,"y":0.7650148088851577}]',
      black_holes:
        '[{"x":0.29754724111866965,"y":0.33860273073240454},{"x":0.5227928949357521,"y":0.7240378994713033},{"x":0.902989417989418,"y":0.4433984678549623},{"x":0.704954648526077,"y":0.26755477336117894},{"x":0.12218820861678005,"y":0.8377146312652641}]',
      black_hole_map: '[3,2,0,4,1]',
      name: 'hard',
    },
  ]);
}
